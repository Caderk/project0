# Use the official python image
FROM python:3.12.3

# Create and set the working directory
WORKDIR /emotion-detection-service

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0

# Copy package.json and package-lock.json
COPY requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 3002
EXPOSE 3003

# Start the application
CMD ["python", "use.py"]