# General development tips

## Setting up secure connections

### Generating a new SSH key

Source: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key>

To generate a new SSH key:

```bash
ssh-keygen -t ed25519 -C "carlos.radtke.a@gmail.com"
```

Replace with your email address accordingly.

### Auto-launching ssh-agent

Source: <https://docs.github.com/en/authentication/connecting-to-github-with-ssh/working-with-ssh-key-passphrases#auto-launching-ssh-agent-on-git-for-windows>

Then to add it to the ssh-agent as soon as I open the terminal we have to edit .bashrc:

```bash
sudo nano .bashrc
```

Adding this lines to the end of the file:

```bash
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
## Setting up Version Control

### Installing Github CLI

Source: <https://github.com/cli/cli/blob/trunk/docs/install_linux.md#debian-ubuntu-linux-raspberry-pi-os-apt>

```bash
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
	&& sudo mkdir -p -m 755 /etc/apt/keyrings \
        && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
	&& sudo apt install gh -y
```

### Authenticate using Github CLI

```bash
gh auth login
```

Follow the interactive prompts to authenticate with GitHub.

### Adding the SSH Key to Github

We can add the file directly using Github CLI.

```bash
gh ssh-key add .ssh/id_ed25519.pub -t "carlos-pc"
```

### Configuring Git credentials

When we need to configure git so we can commit:

```bash
git config --global user.name "Carlos Radtke"
git config --global user.email carlos.radtke.a@gmail.com
```

### Adding an existing local repository to Github (If repository does not exists on remote)

Create a new remote repository

```bash
gh repo create
```

### Cloning a repository (If repository already exists on remote but not locally)

To clone the repository (If it is a private repository you need to be a collaborator):

```bash
git clone git@github.com:Caderk/project0.git
```

If the repositoy is empty, we would need to do a first commit to create a branch:
```bash
echo "# New Project!" >> README.md # We need at least one file in the repository
git add .
git commit -m "First commit"
git push
git switch -c develop
git push -u origin develop
```

To create a local develop branch tracking origin develop branch (if it has one):

```bash

git checkout -b develop origin/develop
```

### Initializing a new repository (If repository does not exists locally)

Source: <https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#initializing-a-git-repository>


There needs to be at least one file on the local repository.
```bash
git init -b main
echo "# CalculadoraF29" >> README.md # We need at least one file in the repository
git add .
git commit -m "First commit"
```


In case you coudn't directly push your local repository using the last command, use this:

```bash
git remote add origin REMOTE-URL
git remote -v
git push origin main
```

## Working with a remote machine

### To ssh to remote machine

Install openssh-server on the remote machine:

```bash
sudo apt install openssh-server
```

We can copy our ssh public key on the remote machine to authenticate without using a password:

```bash
ssh-copy-id carlos@192.168.1.82
```

We can connect to the remote machine using its private ip:

```bash
ssh -a 192.168.1.82
```

### Transfering files

We can use rsync to transfer files from the development to production environments:

```bash
rsync -avz --delete --filter=":- .gitignore" /home/carlos/projects/project0 carlos@192.168.1.82:/home/carlos/projects
```

If you want it the other way around:

```bash
rsync -avz --delete --filter=":- .gitignore" carlos@192.168.1.82:/home/carlos/projects/project0 /home/carlos/projects
```

## Setting up Docker

### Installing Docker and Docker Compose

Source: <https://docs.docker.com/engine/install/ubuntu/>

Uninstall all conflicting packages:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

Set up Docker's APT repository:

```bash
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

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Follow the common Docker post-installation steps

Source: <https://docs.docker.com/engine/install/linux-postinstall/>

To avoid having to use 'sudo' with Docker commands:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

For the changes to take effect, re-log or run:

```bash
newgrp docker
```

To configure Docker to start on boot with systemd:

```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

You can stop Docker from starting on boot by running:

```bash
sudo systemctl disable docker.service
sudo systemctl disable containerd.service
```

## Setting up a node development environment

### Installing Node Version Manager (NVM)

Source: <https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating>

We run the following command to download and execute the NVM install script:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

### Installing Node.js

Source: <https://nodejs.org/en/download/package-manager>

Once NVM is installed we use it to install the latest LTS version:

```bash
# download and install Node.js (you may need to restart the terminal)
nvm install 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
```

## Setting up a Python3 development environment

First, since in wsl2 "python3" comes installed by default, I would like to use it by using the alias "python". For that we will an extra line to ".bashrc":

```bash
alias python=python3
```

Update changes using this command:

```bash
source ~/.bashrc 
```

Before creating a virtual environment we need to install the python3-venv package using the following command:

```bash
sudo apt install python3.12-venv
```

To create a virtual environment (vscode makes it more comfortable to put it in the root of the workspace for some reason)

```bash
python -m venv .venv
```

To work on the virtual environment

```bash
source .venv/bin/activate
```

For an unknown reason, I needed to install setuptools:

```bash
pip install --upgrade setuptools
```

## Acquiring SSL certification (Do only on the production environment)

Source: <https://certbot.eff.org/instructions?ws=other&os=snap>

To acquire an SSL certificate for our DNS we can use certbot:

```bash
sudo snap install --classic certbot
sudo certbot certonly --standalone -d caderk.ddns.net
```

We should in theory have a certbot command to renew the certificate in "systemctl list-timers".
