# Use the official python image
FROM python:3.12.3

# Create and set the working directory
WORKDIR /digit-recognition-service

# Copy package.json and package-lock.json
COPY requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose port 3020
EXPOSE 3020

# Start the uvicorn application
CMD ["uvicorn", "app:app", "--port", "3020", "--host", "0.0.0.0"]
