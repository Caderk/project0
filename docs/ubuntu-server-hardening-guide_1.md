# Hardening an Ubuntu Server Before Exposing It to the Internet

A step-by-step guide. Work through it roughly top to bottom — the ordering matters, because some steps (like the firewall) can lock you out if you do them before others (like setting up SSH keys).

---

## ⚠️ Before you start: don't lock yourself out

Two rules that will save you a lot of pain:

1. **Keep a second terminal open.** Whenever you change SSH or firewall settings, keep your *current* SSH session open and test the new settings in a *new* session. If something is broken, you still have the working session to fix it.
2. **Have out-of-band access if you can.** If this is a VPS, know where the provider's web console / serial console is. If it's a physical machine, keep a keyboard and monitor handy. That's your escape hatch if SSH ever becomes unreachable.

This guide is written for **Ubuntu 26.04 LTS ("Resolute Raccoon")**. Confirm your version with:

```bash
lsb_release -a
```

> **What 26.04 already does for you.** A fresh 26.04 server ships with a meaningfully higher security floor than older releases, so a few steps below are about *verifying* rather than *enabling*:
> - **Unattended security updates are on by default** (Step 6 is mostly verification).
> - **OpenSSH 10.2** is the default, with post-quantum ML-KEM key exchange enabled and keyboard-interactive auth already off — so your crypto baseline is strong before you touch anything (Step 3 still hardens *authentication policy*).
> - **AppArmor is enforcing ~108 profiles** out of the box (the optional MAC step is verification).
> - **`sudo-rs`** (a memory-safe Rust reimplementation) is the default `sudo`, and **rust-coreutils** provides the core utilities. These are transparent for normal use, but if you rely on exotic `sudoers` features or unusual coreutils flags in scripts, test them — a handful of edge cases behave differently from the classic GNU/C tools.

---

## Step 0: Do you even need to expose it?

The single biggest security win is reducing what's reachable from the public internet. Before opening any ports, decide which of these fits:

- **Only you (or a few trusted people) need access** → Don't port-forward at all. Put the server behind a VPN:
  - **Tailscale** — easiest; creates a private network between your devices with almost no config. `curl -fsSL https://tailscale.com/install.sh | sh` then `sudo tailscale up`.
  - **WireGuard** — self-hosted, lightweight, more setup. Good if you don't want to rely on a third party.
  - With a VPN, you forward *zero* ports and your services are invisible to the internet. This eliminates most of your attack surface.
- **You're serving a public website but want to hide your home IP / avoid opening ports** → Use a **Cloudflare Tunnel** (`cloudflared`). It dials *out* to Cloudflare, so no inbound ports are needed and your origin IP stays hidden.
- **You genuinely need open public access on specific ports** (e.g. a game server, public SSH) → Continue with the steps below to harden the direct exposure.

Most self-hosting setups should use a VPN or tunnel. Only do direct port-forwarding when you actually need open public access.

---

## Step 1: Create a non-root user with sudo

If you already log in as a normal user, skip this. If you only have `root`, create a regular account — you should never expose direct root login.

```bash
# As root:
adduser yourname
usermod -aG sudo yourname
```

From now on, log in as `yourname` and use `sudo` for administrative tasks.

---

## Step 2: Set up SSH key authentication

Passwords get brute-forced. Keys don't. You'll generate a key pair on **your own computer** (the client) and put the public half on the server.

**On your local machine** (Linux/macOS/Windows PowerShell all have `ssh-keygen`):

```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

Press Enter to accept the default location (`~/.ssh/id_ed25519`). **Set a passphrase** when prompted — this encrypts the key on disk so a stolen laptop doesn't equal a stolen server.

**Copy the public key to the server:**

```bash
ssh-copy-id yourname@SERVER_IP
```

If `ssh-copy-id` isn't available, do it manually:

```bash
# On the server, as yourname:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys      # paste the contents of id_ed25519.pub on its own line
chmod 600 ~/.ssh/authorized_keys
```

**Test it.** In a new terminal:

```bash
ssh yourname@SERVER_IP
```

You should log in using the key (it'll ask for your *key passphrase*, not the server password). **Do not proceed until key login works** — the next step disables passwords.

---

## Step 3: Harden the SSH server config

The cleanest approach on modern Ubuntu is a drop-in file, so you don't fight with defaults that live in `/etc/ssh/sshd_config.d/`.

> **Gotcha:** Ubuntu ships override files in `/etc/ssh/sshd_config.d/`. A setting you put in the main `sshd_config` can be silently overridden by a file there (for example, cloud images sometimes re-enable password auth). Using your own drop-in with a high number (`99-`) ensures yours wins.

Create the file:

```bash
sudo nano /etc/ssh/sshd_config.d/99-hardening.conf
```

Paste:

```
# Authentication
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey

# Reduce attack surface
MaxAuthTries 3
X11Forwarding no

# Optional: restrict who can log in at all
# AllowUsers yourname
```

**Validate the config before applying** (this catches typos that would otherwise break SSH):

```bash
sudo sshd -t
```

If it prints nothing, it's valid. Apply it:

```bash
sudo systemctl restart ssh
```

> On 26.04, SSH is socket-activated. Restarting `ssh` (the service) is correct for **authentication** changes like the ones above. Only **listener** changes (the port or listen address) require touching the socket — see the next section.

Now **open a new terminal and confirm you can still log in.** Confirm that password login is refused (try `ssh -o PubkeyAuthentication=no yourname@SERVER_IP` — it should be rejected).

### Optional: change the SSH port

Moving off port 22 adds no real security, but it massively cuts the noise in your logs from automated scanners. On 26.04 this is **not** done in `sshd_config` — SSH is socket-activated, so the `ssh.socket` unit owns the listening port and any `Port` directive in `sshd_config` is ignored. Override the socket instead:

```bash
sudo systemctl edit ssh.socket
```

In the editor, add:

```
[Socket]
ListenStream=
ListenStream=0.0.0.0:2222
ListenStream=[::]:2222
```

The empty `ListenStream=` is important — it clears the default port 22 binding so SSH listens *only* on 2222 (otherwise it listens on both). Then reload systemd and restart the socket:

```bash
sudo sshd -t
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
```

Verify it took effect, then allow the new port in the firewall (next step) **before** relying on it, and connect with `ssh -p 2222 yourname@SERVER_IP`:

```bash
sudo ss -tlpn | grep 2222
```

> If you'd rather not deal with socket activation at all, you can revert to the classic always-on daemon:
> ```bash
> sudo systemctl disable --now ssh.socket
> sudo systemctl enable --now ssh.service
> ```
> With the service model, the `Port` directive in your `sshd_config` drop-in works the traditional way. Most people should just use the socket override above.

---

## Step 4: Set up a firewall (default-deny)

Ubuntu includes `ufw`. The strategy: deny everything inbound, then allow only what you need.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

**Allow SSH before enabling the firewall** — otherwise you'll cut yourself off:

```bash
sudo ufw allow OpenSSH          # if still on port 22
# OR, if you changed the port:
# sudo ufw allow 2222/tcp
```

Allow web ports only if you're serving HTTP/HTTPS:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Enable and review:

```bash
sudo ufw enable
sudo ufw status verbose
```

Only the ports you explicitly allowed should be open. Everything else is now closed to the outside.

> **If you run Docker:** be aware that Docker writes its own iptables/nftables rules, and a container's *published* ports (`-p 8080:80`) bypass UFW entirely — UFW will show them as blocked while they're actually reachable from the internet. Bind container ports to localhost (`-p 127.0.0.1:8080:80`) and front them with your reverse proxy, or use a tool like `ufw-docker` to reconcile the two.

---

## Step 5: Install fail2ban

`fail2ban` watches your logs and temporarily bans IPs that rack up failed logins — this blunts the constant brute-forcing you'll see on any exposed SSH port.

```bash
sudo apt update
sudo apt install fail2ban
```

Create a local config (never edit `jail.conf` directly — updates overwrite it):

```bash
sudo nano /etc/fail2ban/jail.local
```

```
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
# If you moved SSH off port 22, set it here too:
# port = 2222
```

Enable and start it:

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

The last command shows currently banned IPs and the jail's status. Within a day of exposure you'll likely see bans accumulating.

---

## Step 6: Enable automatic security updates

Unpatched software is one of the most common ways servers get compromised. **26.04 enables unattended security updates by default**, so this step is mostly about confirming it's active and tuning the reboot behavior.

First, verify it's already on:

```bash
systemctl list-timers | grep apt
cat /etc/apt/apt.conf.d/20auto-upgrades
```

If the package is somehow missing or you want to (re)configure it interactively:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Either way, `/etc/apt/apt.conf.d/20auto-upgrades` should contain:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Optionally, tune `/etc/apt/apt.conf.d/50unattended-upgrades` to reboot automatically when a kernel update requires it:

```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

```
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

You can also uncomment the `-updates` line in that file to receive non-security updates automatically. Automatic updates don't replace occasional manual check-ins — log in periodically to run `sudo apt update && sudo apt upgrade` and confirm nothing needs attention.

---

## Step 7: Audit what's actually listening

You can't secure what you don't know is running. List every service bound to a network interface:

```bash
sudo ss -tulpn
```

Read the **Local Address** column carefully:

- `0.0.0.0:PORT` or `[::]:PORT` → listening on **all interfaces**, reachable from the internet (if the firewall allows it).
- `127.0.0.1:PORT` or `[::1]:PORT` → listening on **localhost only**, not reachable from outside. This is what you want for anything that doesn't need public access.

Anything that only needs local access — databases, admin panels, internal APIs, metrics endpoints — should bind to localhost, not all interfaces. Some common examples:

- **MySQL/MariaDB:** set `bind-address = 127.0.0.1` in `/etc/mysql/mysql.conf.d/mysqld.cnf`.
- **PostgreSQL:** set `listen_addresses = 'localhost'` in `postgresql.conf`.
- **Redis:** set `bind 127.0.0.1` in `/etc/redis/redis.conf`.

If a service must be reachable but only by you, prefer reaching it over the VPN (Step 0) rather than opening a port. The fewer things listening on `0.0.0.0`, the smaller your attack surface.

---

## Step 8: Put web services behind a reverse proxy with TLS

If you're serving anything over HTTP, terminate it with HTTPS using a reverse proxy and free Let's Encrypt certificates. This encrypts traffic and lets you run multiple services behind one set of ports.

### Option A: Caddy (easiest — automatic HTTPS)

Caddy obtains and renews certificates automatically with zero extra config.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Edit `/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy 127.0.0.1:8080
}
```

```bash
sudo systemctl reload caddy
```

That's it — Caddy fetches a certificate and serves your app at `https://example.com`, proxying to whatever is running on port 8080. (Requires ports 80 and 443 open and your domain's DNS pointing at the server.)

### Option B: nginx + certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx
# configure an nginx server block that proxies to your app, then:
sudo certbot --nginx -d example.com
```

Certbot edits your nginx config for HTTPS and sets up automatic renewal.

> On 26.04 the packaged web servers already ship with modern TLS defaults — nginx defaults to TLS 1.2/1.3 and Apache disables TLS 1.0/1.1 — so you don't need to hand-tune protocol versions to avoid deprecated crypto. nginx 1.28 also ships production-ready HTTP/3 (QUIC); if you enable it, remember to open **UDP** 443 in the firewall alongside TCP 443.

---

## Step 9: Set up backups (and test restoring them)

A backup you've never restored is a hope, not a backup. Aim for the **3-2-1 rule**: 3 copies, on 2 different media, with 1 off-site.

A good tool for this is **restic** (deduplicating, encrypted, supports many backends):

```bash
sudo apt install restic
restic init --repo /path/to/backup/location   # or an S3/B2/SFTP backend
restic backup /etc /home /var/www              # back up what matters to you
```

Whatever you choose, **periodically do a real restore** into a temporary location and confirm the files come back intact. Schedule backups with a systemd timer or cron, and make sure the backup destination isn't on the same disk as the data.

---

## Step 10: Monitoring and logging

You want to notice when something's off — a spike in failed logins, a service that shouldn't be running, unexpected resource use.

**Check authentication activity:**

```bash
sudo journalctl -u ssh --since "today" | grep -i "fail\|invalid"
# fail2ban also surfaces this:
sudo fail2ban-client status sshd
```

**Check what's running and resource use:**

```bash
sudo systemctl list-units --type=service --state=running
top    # or install 'htop' / 'btop' for a nicer view
```

For ongoing visibility, consider a lightweight option like **netdata** (real-time dashboards) for a single box, or an external **uptime monitor** (e.g. Uptime Kuma, or a hosted ping service) so you're alerted if the server goes down or a service stops responding. The goal is simply that *you* find out about problems before they become incidents.

---

## Optional hardening (as your risk tolerance shrinks)

These go beyond the basics. Add them if the server is sensitive or internet-exposed long-term.

### Two-factor authentication on SSH

Add a TOTP code (Google Authenticator / Authy) on top of your key.

```bash
sudo apt install libpam-google-authenticator
google-authenticator      # run as your user; scan the QR, save the backup codes
```

Then edit `/etc/pam.d/sshd` to add:

```
auth required pam_google_authenticator.so
```

…and in your SSH drop-in, require *both* key and code:

```
KbdInteractiveAuthentication yes
AuthenticationMethods publickey,keyboard-interactive
```

> Note: this changes the `KbdInteractiveAuthentication no` / `AuthenticationMethods publickey` lines from Step 3. Restart `ssh` and test in a new session before closing your working one.

### Kernel / network hardening with sysctl

Sensible defaults that reduce certain network-level risks:

```bash
sudo nano /etc/sysctl.d/99-hardening.conf
```

```
# Ignore ICMP broadcasts and bogus error responses
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable source-address verification (anti-spoofing)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Log impossible (martian) packets
net.ipv4.conf.all.log_martians = 1

# Don't accept source-routed or redirected packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# SYN flood protection
net.ipv4.tcp_syncookies = 1
```

```bash
sudo sysctl --system
```

### Consider a mandatory-access-control layer

26.04 ships **AppArmor enforcing ~108 profiles** out of the box — confirm with `sudo aa-status`, which lists how many profiles are loaded and in enforce mode. For internet-facing services, check that the ones you've installed are running under a profile where one exists, and consider adding profiles for anything that isn't confined. Newer services in 26.04 (for example MariaDB) now ship with their own tailored AppArmor profiles and hardened systemd units by default.

---

## Quick checklist

- [ ] Decided whether to expose directly, or use a VPN / tunnel instead (Step 0)
- [ ] Non-root sudo user created (Step 1)
- [ ] SSH key login working (Step 2)
- [ ] Password auth and root login disabled, config validated with `sshd -t` (Step 3)
- [ ] Firewall enabled, default-deny, only needed ports open (Step 4)
- [ ] fail2ban installed and watching SSH (Step 5)
- [ ] Automatic security updates enabled (Step 6)
- [ ] Audited listening services; internal ones bound to localhost (Step 7)
- [ ] Web traffic behind a reverse proxy with TLS (Step 8)
- [ ] Backups configured **and a restore tested** (Step 9)
- [ ] Monitoring / log-checking in place (Step 10)
- [ ] (Optional) 2FA, sysctl hardening, AppArmor profiles

---

*This covers the fundamentals that apply to almost any setup. The exact details — which ports to open, which services to bind to localhost, what to back up — depend on what you're running. If you tell me your specific stack (a website, Nextcloud, a game server, just SSH for remote access), the steps above can be tailored with the precise configuration for it.*
