We need node, and to install node we will use nvm (node version manager) which we can isntall following these instructions:

https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Once installed we navigate the following link and follow the instructions for latest LTS version on Linux using nvm:

https://nodejs.org/en/download/package-manager (We can ignore the line in which nvm is installed since we already did that.)

```
# download and install Node.js (you may need to restart the terminal)
nvm install 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
```

For development, we can install nodemon so changes take effect inmediatly:

```
npm install --save-dev nodemon 
```

Then we can finally run the service using:

```
npm run dev
```