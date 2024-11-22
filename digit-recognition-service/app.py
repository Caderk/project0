import torch
from models.modelM5 import ModelM5  # Adjust if using ModelM3 or ModelM7
from torchvision import transforms
from PIL import Image
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# Initialize the FastAPI app
app = FastAPI(root_path="/digit-recognition-service")

# Load the model
model = ModelM5()
model.load_state_dict(torch.load('logs/modelM5/model009.pth', map_location='cpu'))
model.eval()

# Move the model to the appropriate device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

# Define the transformations
transform = transforms.Compose([
    transforms.ToTensor(),
    # Include normalization if used during training
    # transforms.Normalize((mean,), (std,)),
])

# Define the request body schema
class ImageData(BaseModel):
    image: List[List[int]]  # 2D list representing the 28x28 image array

@app.post("/predict")
async def predict(data: ImageData):
    # Extract the image array from the request data
    image_array = data.image

    # Convert the image array to a NumPy array
    try:
        image_array = np.array(image_array, dtype=np.uint8)
        # Ensure the array has the correct shape
        if image_array.shape != (28, 28):
            raise ValueError("Invalid image shape, expected (28, 28)")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Convert the NumPy array to a PIL Image
    image = Image.fromarray(image_array, mode='L')

    # Apply the transformations
    input_tensor = transform(image).unsqueeze(0).to(device)  # Shape: (1, 1, 28, 28)

    # Make prediction
    with torch.no_grad():
        output = model(input_tensor)
        predicted_digit = output.argmax(dim=1).item()

    # Return the prediction as a JSON response
    return {"predicted_digit": predicted_digit}
