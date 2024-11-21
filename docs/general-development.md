# Setting up Version Control

## Generating a new SSH key to connect to Github

Source: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key

To generate a new SSH key:
```
ssh-keygen -t ed25519 -C "carlos.radtke.a@gmail.com"
```
Replace with your email address accordingly.

## Auto-launching ssh-agent on Git

Source: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/working-with-ssh-key-passphrases#auto-launching-ssh-agent-on-git-for-windows

Then to add it to the ssh-agent as soon as I open the terminal we have to edit .bashrc:
```
sudo nano .bashrc
```

Adding this lines to the end of the file:
```
# Pasted from Github

env=~/.ssh/agent.env

agent_load_env () { test -f "$env" && . "$env" >| /dev/null ; }

agent_start () {
    (umask 077; ssh-agent >| "$env")
    . "$env" >| /dev/null ; }

agent_load_env

# agent_run_state: 0=agent running w/ key; 1=agent w/o key; 2=agent not running
agent_run_state=$(ssh-add -l >| /dev/null 2>&1; echo $?)

if [ ! "$SSH_AUTH_SOCK" ] || [ $agent_run_state = 2 ]; then
    agent_start
    ssh-add
elif [ "$SSH_AUTH_SOCK" ] && [ $agent_run_state = 1 ]; then
    ssh-add
fi

unset env
```

## Configuring Git credentials

When we need to configure git so we can commit:
```
git config --global user.name "Carlos Radtke"
git config --global user.email carlos.radtke.a@gmail.com
```

# Setting up a node development environment

## Installing Node Version Manager (NVM)

Source: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating

We run the following command to download and execute the NVM install script:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

## Installing Node.js

Source: https://nodejs.org/en/download/package-manager

Once NVM is installed we use it to install the latest LTS version:
```
# download and install Node.js (you may need to restart the terminal)
nvm install 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
```

# Setting up Docker

## Installing Docker and Docker Compose

Source: https://docs.docker.com/engine/install/ubuntu/

Uninstall all conflicting packages:

```
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

Set up Docker's APT repository:
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

Finally, install the latest version of Docker:
```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Follow the common Docker post-installation steps

Source: https://docs.docker.com/engine/install/linux-postinstall/

To avoid having to use 'sudo' with Docker commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

For the changes to take effect, re-log or run:
```
newgrp docker
```

To configure Docker to start on boot with systemd:

```
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

You can stop Docker from starting on boot by running:
```
sudo systemctl disable docker.service
sudo systemctl disable containerd.service
```

# Working with the production environment

We can connect to the production environment using its private ip:
```
ssh -a 192.168.1.82
```

We can use rsync to transfer files between the development and production environments:
```
rsync -avz /home/carlos/projects/project0 carlos@192.168.1.82:/home/carlos/projects
```

# Acquiring SSL certification (Do only on the production environment)

To acquire an SSL certificate for our DNS we can use certbot:
```
sudo apt install certbot
sudo certbot certonly --standalone -d caderk.ddns.net
```

We should create a renewal task using chrontab:
```
sudo crontab -e
```

Then we add at the end of the file the following line:
```
0 3 * * * certbot renew --post-hook "docker compose -f /home/carlos/projects/project0/docker-compose.prod.yml restart nginx" >> /home/carlos/cronjob_logs/certbot_renew.log 2>&1
```

We also need to create the file to store the logs.
```
mkdir /home/carlos/cronjob_logs/
carlos@ubuntu:~$ touch /home/carlos/cronjob_logs/certbot_renew.log
```
