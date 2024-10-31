# On the laptop we should first install docker and docker compose.

We can follow this guide: https://docs.docker.com/engine/install/ubuntu/

We uninstall all conflicting packages

```
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

We set up Docker's apt repository:
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Finally we install the latest version:
```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

# Follow common docker post install guide

We can follow this guide: https://docs.docker.com/engine/install/linux-postinstall/

To avoid having to use sudo to use docker:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

For the changes to take effect re-log or run:
```
newgrp docker
```

Later, to configure Docker to start on boot with systemd:

```
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

We can stop this whenever we want running:
```
sudo systemctl disable docker.service
sudo systemctl disable containerd.service
```