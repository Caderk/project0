# Inventory Service Containerization

Write a Dockerfile
```
# Use the official Node.js LTS image
FROM node:22.11.0

# Create and set the working directory
WORKDIR /inventory-service

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3010

# Start the express application in production mode
CMD ["npm", "run", "start"]
```