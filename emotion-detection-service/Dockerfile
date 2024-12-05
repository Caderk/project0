# Use the official python image
FROM python:3.12.3

# Create and set the working directory
WORKDIR /emotion-detection-service

# Copy package.json and package-lock.json
COPY requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 3020
EXPOSE 3030

# Start the application
CMD ["python", "use.py"]