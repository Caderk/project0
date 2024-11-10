# Use the official Nginx image
FROM nginx:latest

# Add a build time variable set in the docker-compose file
ARG NGINX_CONF

# Remove the default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom configuration file
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf