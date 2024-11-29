# Use the official Node.js LTS image
FROM node:22.11.0

# Set working directory
WORKDIR /inventory-service

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the express application
CMD ["npm", "run", "start"]
