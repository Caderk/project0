# Use the official PostgreSQL image
FROM postgres:15-alpine

# Set environment variables for the database
ENV POSTGRES_DB=inventory_db
ENV POSTGRES_USER=inventory_user
ENV POSTGRES_PASSWORD=inventory_pass

# Copy initialization scripts (if any)
COPY ./initdb.d /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
