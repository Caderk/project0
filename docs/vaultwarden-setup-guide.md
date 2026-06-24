# Self-Hosting Vaultwarden — A Complete Setup Guide

A step-by-step guide for deploying Vaultwarden (the lightweight Rust reimplementation of the Bitwarden server) on your own Linux server using Docker Compose, fronted by a reverse proxy with HTTPS. Written for a technical user who already runs a server.

---

## What you'll end up with

- A single Vaultwarden container (~50 MB RAM at idle) holding your encrypted vault in a local SQLite database.
- All Bitwarden *Premium* features unlocked for free: TOTP storage, file attachments, Bitwarden Send, Emergency Access, and organizations/sharing.
- HTTPS access through a reverse proxy, so the official Bitwarden browser extensions, mobile apps, desktop apps, and CLI all connect unmodified.
- Open registration disabled, an Argon2-hashed admin token, and a backup routine that actually restores correctly.

**Time required:** roughly 45–60 minutes the first time.

---

## Before you start: three decisions

1. **A domain or subdomain.** Bitwarden clients refuse plain HTTP — HTTPS is mandatory, not optional. You need a hostname (e.g. `vault.yourdomain.com`) pointing at your server so you can get a TLS certificate. A subdomain of a domain you already own is ideal. If your server is behind CGNAT or you have no domain, you'll need a tunnel or VPN approach, which is out of scope here but noted at the end.

2. **Which reverse proxy.** This guide uses **Caddy** because its automatic HTTPS is correct out of the box, which matters a lot when the thing you're protecting is every password you own. If you already operate **nginx**, **Traefik**, or **Nginx Proxy Manager**, use what you know — the Vaultwarden side is identical; only the proxy config differs. Configs for all of these live in the Vaultwarden wiki.

3. **Where the data lives — read this carefully.** Vaultwarden's `/data` volume *must* sit on **local storage**, not a network share. SQLite over NFS/CIFS/SMB is a well-documented cause of database corruption. Since you already run a file-sharing server, do **not** be tempted to put the Vaultwarden data directory on that share. Keep it on a local disk and back it up *from* there.

---

## Prerequisites

- A Linux server (any common distro; examples assume Debian/Ubuntu).
- Docker Engine and the Docker Compose plugin installed.
- A hostname resolving to the server, with ports 80 and 443 reachable by the proxy (directly, or via your existing edge).

Quick check that Docker is ready:

```bash
docker --version
docker compose version
```

---

## Step 1 — Create the project directory

Keep the config and the data volume together, on local disk:

```bash
mkdir -p ~/vaultwarden/vw-data
cd ~/vaultwarden
```

`vw-data` will hold the encrypted database, attachments, keys, and settings.

---

## Step 2 — Generate the admin token (Argon2)

The admin panel at `/admin` is protected by `ADMIN_TOKEN`. Modern Vaultwarden expects this as an **Argon2id hash**, not plaintext — a plaintext token throws a security warning in the logs. The easiest way is the hashing command built into the image itself:

```bash
docker run --rm -it vaultwarden/server:latest /vaultwarden hash
```

You'll be prompted for a password twice. **This password is what you'll actually type at `/admin`** — the hash is just what gets stored. Choose a strong one and save it in your notes. The command prints something like:

```
ADMIN_TOKEN='$argon2id$v=19$m=65540,t=3,p=4$SomeSalt$SomeHash'
```

Copy the hash string itself (everything between the single quotes, starting with `$argon2id$`). Keep it for the next step.

> **The `$$` escaping trap:** if you ever paste this hash *directly inside `docker-compose.yml`*, you must double every `$` to `$$`, or Compose will try to interpret `$...` as a variable. The guide below avoids this entirely by putting the token in a separate `.env` file, where **no escaping is needed**. Pick one approach and don't mix them.

---

## Step 3 — Create the secrets file

Put sensitive values in a permission-restricted `.env` file rather than in the compose file:

```bash
touch ~/vaultwarden/.env
chmod 600 ~/vaultwarden/.env
```

Edit `~/vaultwarden/.env` and add (no `$$` escaping here — paste the hash exactly as generated):

```env
DOMAIN=https://vault.yourdomain.com
ADMIN_TOKEN=$argon2id$v=19$m=65540,t=3,p=4$SomeSalt$SomeHash
SIGNUPS_ALLOWED=true
TZ=America/Santiago
```

Notes:
- `DOMAIN` must be the full public HTTPS URL. Getting this wrong silently breaks 2FA enrollment and WebAuthn, so double-check it.
- `SIGNUPS_ALLOWED=true` is **temporary** — you'll flip it to `false` right after creating your own account in Step 6.
- Set `TZ` to your zone so logs (and Fail2Ban later) have correct timestamps.

---

## Step 4 — Write the docker-compose file

Create `~/vaultwarden/docker-compose.yml`:

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:1.35.7   # pin a version; see "Updates" for the latest
    container_name: vaultwarden
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./vw-data:/data
    ports:
      # Bind to localhost only — the reverse proxy reaches it; nothing is exposed publicly.
      - "127.0.0.1:8080:80"
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/alive"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
```

A few points worth understanding:

- **Pin the image tag** (e.g. `1.35.7`) instead of `latest`. You want updates to be a deliberate act, not something that happens silently on a restart — this is your credential store.
- **`127.0.0.1:8080:80`** binds the container to localhost only. The reverse proxy connects to it locally; the container is never directly exposed to the internet.
- **No WebSocket port.** Older guides expose port `3012` with `WEBSOCKET_ENABLED`. Current Vaultwarden serves live sync/notifications over the main HTTP port, so the separate `3012` port is legacy and omitted here.

---

## Step 5 — Reverse proxy and HTTPS

The proxy terminates TLS and forwards plain HTTP to the container on localhost. The Vaultwarden project explicitly recommends terminating TLS at a reverse proxy rather than using its built-in SSL.

### Option A — Caddy (recommended)

A minimal `Caddyfile`:

```
vault.yourdomain.com {
    reverse_proxy 127.0.0.1:8080
}
```

That's the whole thing. Caddy obtains and renews a Let's Encrypt certificate automatically. Run Caddy however you already do (system package or its own container); just ensure ports 80 and 443 reach it.

### Option B — nginx

Core of a server block (you supply the certs, e.g. via certbot):

```nginx
server {
    listen 443 ssl;
    server_name vault.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/vault.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vault.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option C — Traefik / Nginx Proxy Manager

Both work fine; configure a host rule for `vault.yourdomain.com` forwarding to the Vaultwarden container/port with TLS enabled. NPM users can run it in the same compose stack on a shared Docker network and point a Proxy Host at `vaultwarden:80`.

---

## Step 6 — First start and locking down registration

Bring the stack up:

```bash
cd ~/vaultwarden
docker compose up -d
docker compose logs -f
```

Watch the logs for a clean startup, then visit `https://vault.yourdomain.com`. You should get a valid certificate and the web vault login page.

1. **Create your account** through the web vault. Pick a strong, memorable master password — if you lose it, your vault is unrecoverable by design. There is no reset.
2. Log in once to confirm everything works.
3. **Disable open signups.** Edit `~/vaultwarden/.env` and set:

   ```env
   SIGNUPS_ALLOWED=false
   ```

   Then apply it:

   ```bash
   docker compose up -d
   ```

After this, no one can self-register. To add anyone else later, invite them from the admin panel (which also requires SMTP — see below).

---

## Step 7 — Connect your clients

All official Bitwarden clients work. In each, change the server URL **before** logging in:

- **Browser extension:** install the Bitwarden extension, open it, and on the login screen tap the region/settings (gear) and set the **Server URL** to `https://vault.yourdomain.com`. Then log in.
- **Mobile (iOS/Android):** Bitwarden app → on the login screen, set self-hosted environment / server URL to your domain, then log in.
- **Desktop app:** same — settings → self-hosted, set the server URL.
- **CLI:** `bw config server https://vault.yourdomain.com` then `bw login`.

Once connected, vaults sync across all of them just like the hosted Bitwarden service.

---

## Step 8 — Hardening

### Lock down the admin panel
After initial setup you have two good options:

- **Disable it entirely (simplest, best for single-user):** remove `ADMIN_TOKEN` from `.env` and `docker compose up -d`. With no token set, `/admin` returns 404. Re-add it only when you need it.
- **Keep it but restrict by IP** at the proxy. For nginx:

  ```nginx
  location /admin {
      allow 127.0.0.1;      # or your LAN / VPN range
      deny all;
      proxy_pass http://127.0.0.1:8080;
      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
  }
  ```

### Optional but recommended SMTP
Setting SMTP (in the admin panel or via env vars) enables email invites, account-verification mail, and email-based 2FA. Without it you can still run single-user fine, but invitations won't send.

### Fail2Ban
Vaultwarden logs failed login attempts. Pair it with Fail2Ban to ban IPs that brute-force the login or `/admin`. Point a jail at the Vaultwarden log file (ensure `LOG_FILE` is set and `TZ` is correct so timestamps line up). The Vaultwarden wiki has a ready-made filter and jail.

### General
- The `no-new-privileges` flag is already set above. You can also run as a non-root UID/GID with `user: "1000:1000"` if you prefer.
- Keep the host patched and firewalled so only the proxy's ports are exposed.

---

## Step 9 — Backups (don't skip this)

This is the part people get wrong, and getting it wrong means silent corruption. **Never raw-copy a live `db.sqlite3`** — the `-wal` and `-shm` sidecar files mean a plain `cp` can capture an inconsistent database.

Use Vaultwarden's built-in backup command, which produces a consistent snapshot:

```bash
docker exec vaultwarden /vaultwarden backup
```

That writes a timestamped consistent SQLite file into `/data`. A complete backup is the database **plus** these, all from `vw-data/`:

- `config.json`
- `rsa_key.pem` (older installs: `rsa_key.*` — back up whichever exists; these keys are required to decrypt logins)
- `attachments/`
- `sends/`

> Restore the database without the `attachments/` folder and your file attachments come back broken — always keep them together.

A simple scheduled approach via cron: run the `backup` command, then `tar` up the consistent DB snapshot together with `config.json`, the RSA key, `attachments/`, and `sends/`, and copy that archive off the box (this is a fine use of your existing file-sharing server — as a backup *destination*, just not as the live data location). **Test a restore at least once** before you trust it: restoring is only real if you've done it.

---

## Step 10 — Updates

Vaultwarden ships frequently and it's a credential store, so patch deliberately on a schedule and watch the GitHub releases feed:

```bash
cd ~/vaultwarden
# 1. Back up first (Step 9)
# 2. Bump the image tag in docker-compose.yml to the new version
docker compose pull
docker compose up -d
docker compose logs -f      # confirm a clean start
```

Because you pinned a version, you control exactly when this happens. Check `https://github.com/dani-garcia/vaultwarden/releases` for the current stable tag before bumping. (As of early 2026 the stable line is 1.35.x.)

---

## Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| Clients refuse to connect / "could not reach server" | Not actually HTTPS, or wrong `DOMAIN` | Confirm the cert is valid and `DOMAIN` exactly matches the public URL |
| Log warns about insecure admin token | Plaintext `ADMIN_TOKEN` | Regenerate as Argon2 (Step 2); in `.env` no `$$` escaping needed |
| 2FA/WebAuthn enrollment fails silently | `DOMAIN` mismatch | Set `DOMAIN` to the exact HTTPS origin and restart |
| "readonly database" on backup | `/data` not writable by the process | Fix ownership/permissions on `vw-data` |
| Random DB corruption | `/data` on a network share | Move it to local disk — never NFS/CIFS/SMB |
| `/admin` returns 404 | `ADMIN_TOKEN` unset | Expected if you disabled it; re-add the token to re-enable |

---

## Notes for your specific setup

- You already run a file-sharing server. Use it as a **backup destination**, never as the home of the live `vw-data` volume — keep that on local disk to avoid SQLite-over-network corruption.
- If your server sits behind CGNAT or you don't want to expose 443 publicly, you can keep Vaultwarden reachable over a VPN (e.g. WireGuard/Tailscale) instead of public HTTPS — clients connect to the internal hostname, and you skip public exposure entirely. The HTTPS requirement still applies on that internal network.
- Vaultwarden is community-maintained and, unlike the official Bitwarden server, hasn't undergone the same formal third-party audits. For a personal/family vault this is widely considered an acceptable tradeoff; just factor it into your threat model.

---

*This guide reflects Vaultwarden as of early 2026 (the 1.35.x line). Verify the current stable release and the wiki's proxy/Fail2Ban examples before deploying, since environment variables and recommendations evolve between versions.*
