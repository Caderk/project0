# Configuring Nginx

Since we are using SSL certificates on the production environment but not on the development envinronment, we need to write two configurations for Nginx.

## Development configuration

First we write a configuration file for the development environment.
```
cat > dev.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /inventory-service/ {
        proxy_pass http://inventory:3010/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
```

## Production configuration

Then we write a configuration file for the production environment.
```
cat > dev.conf << 'EOF'
# Redirect HTTP to HTTPS only for caderk.ddns.net
server {
    listen 80;
    server_name caderk.ddns.net;
    return 301 https://$host$request_uri;
}

# HTTPS server block only for caderk.ddns.net
server {
    listen 443 ssl;
    server_name caderk.ddns.net;

    ssl_certificate /etc/letsencrypt/live/caderk.ddns.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/caderk.ddns.net/privkey.pem;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /inventory-service/ {
        proxy_pass http://inventory:3010/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
```