import cv2
import torch
import torch.nn as nn
from torchvision import transforms
import numpy as np
from models.emotionCNN import EmotionCNN



# Load the trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = EmotionCNN().to(device)

# Load the saved model weights
model.load_state_dict(
    torch.load("model_weights.pth", map_location=device, weights_only=False)
)
model.eval()

# Define the emotion labels
emotion_labels = {
    0: "Angry",
    1: "Disgust",
    2: "Fear",
    3: "Happy",
    4: "Sad",
    5: "Surprise",
    6: "Neutral",
}

# Define the transformations (must match those used during training)
transform = transforms.Compose(
    [
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,)),
    ]
)

# Initialize the webcam
cap = cv2.VideoCapture(0)

# Check if the webcam is opened correctly
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# Main loop
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    if not ret:
        print("Error: Failed to capture image")
        break

    # Preprocess the frame
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Optionally, detect faces and focus on them
    # For simplicity, we'll use the whole frame here
    # Resize to 48x48 as expected by the model
    gray_resized = cv2.resize(gray, (48, 48))

    # Normalize and convert to tensor
    img = gray_resized.astype("float32")
    img = (img / 255.0 - 0.5) / 0.5  # Normalize (match training normalization)
    img = np.expand_dims(img, axis=0)  # Add channel dimension
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    img_tensor = torch.from_numpy(img).to(device)

    # Make prediction
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs, 1)
        predicted_emotion = emotion_labels[predicted.item()]

    # Display the resulting frame
    # Put the predicted emotion text on the frame
    cv2.putText(
        frame,
        f"Emotion: {predicted_emotion}",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2,
    )

    cv2.imshow("Emotion Recognition", frame)

    # Break the loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()
