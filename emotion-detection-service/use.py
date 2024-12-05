import cv2
import torch
from torchvision import transforms
import numpy as np
import asyncio
import websockets
import base64
import json
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

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

# Define the transformations (must match those used during training)
transform = transforms.Compose(
    [
        transforms.ToPILImage(),
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,)),
    ]
)


async def process_image(websocket):
    frame_count = 0
    process_every_n_frames = 5  # Adjust this value as needed

    async for message in websocket:
        try:
            # Decode the base64 image
            img_data = base64.b64decode(message)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            frame_count += 1

            if frame_count % process_every_n_frames == 0:
                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

                # Detect faces in the image
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30),
                    flags=cv2.CASCADE_SCALE_IMAGE,
                )

                emotions_data = []

                for x, y, w, h in faces:
                    face_roi_color = frame[y : y + h, x : x + w]

                    # Preprocess the face region
                    face_gray = cv2.cvtColor(face_roi_color, cv2.COLOR_BGR2GRAY)
                    face_resized = cv2.resize(face_gray, (48, 48))

                    # Apply transformations
                    face_image = transform(face_resized).unsqueeze(0).to(device)

                    # Make prediction
                    with torch.no_grad():
                        outputs = model(face_image)
                        _, predicted = torch.max(outputs, 1)
                        predicted_emotion = emotion_labels[predicted.item()]

                    # Append the face coordinates and emotion to the list
                    emotions_data.append(
                        {
                            "x": int(x),
                            "y": int(y),
                            "w": int(w),
                            "h": int(h),
                            "emotion": predicted_emotion,
                        }
                    )

                # Send the data back to the client
                data = {"emotions": emotions_data}
                await websocket.send(json.dumps(data))
            else:
                # For frames that are not processed, send an empty message or skip
                # Here, we choose to send an empty message
                await websocket.send(json.dumps({}))
        except Exception as e:
            print(f"Error: {e}")
            await websocket.send(json.dumps({"error": "Error processing image"}))


async def main():
    async with websockets.serve(process_image, "0.0.0.0", 3030):
        print("WebSocket server started on ws://0.0.0.0:3030")
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(main())
