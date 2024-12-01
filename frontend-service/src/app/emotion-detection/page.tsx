'use client'

import React, { useRef, useEffect, useState } from 'react';

const WebcamComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [emotionsData, setEmotionsData] = useState([]);

  useEffect(() => {
    let stream;
    let ws;

    const startWebcam = async () => {
      try {
        // Request access to the webcam
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Set the video element's source to the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set up WebSocket connection
        ws = new WebSocket('/emotion-detection-service/ws');

        ws.onopen = () => {
          console.log('WebSocket connection established');
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          // Receive the emotion data from the server
          const data = JSON.parse(event.data);

          if (data.error) {
            console.error(data.error);
            return;
          }

          // Update the emotions data state
          if (data.emotions) {
            setEmotionsData(data.emotions);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
      } catch (err) {
        console.error('Error accessing the webcam: ', err);
      }
    };

    startWebcam();

    return () => {
      // Clean up the stream and WebSocket when the component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    const sendFrame = () => {
      if (videoRef.current && socket && socket.readyState === WebSocket.OPEN) {
        // Create a canvas to capture the current frame
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Get the image data from the canvas
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            // Send the base64 image to the server
            socket.send(base64data);
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg');
      }
    };

    // Send frames at a regular interval
    const intervalId = setInterval(sendFrame, 100); // Adjust the interval as needed

    return () => clearInterval(intervalId);
  }, [socket]);

  useEffect(() => {
    const drawEmotions = () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Overlay the emotions data
        emotionsData.forEach((face) => {
          context.strokeStyle = 'green';
          context.lineWidth = 2;
          context.strokeRect(face.x, face.y, face.w, face.h);

          context.font = '16px Arial';
          context.fillStyle = 'green';
          context.fillText(face.emotion, face.x, face.y - 10);
        });

        requestAnimationFrame(drawEmotions);
      }
    };

    drawEmotions();
  }, [emotionsData]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ width: '100%' }} />
    </div>
  );
};

export default function Page() {
  return (
    <>
      <h1>Emotion Detection</h1>
      <p>This app uses your webcam to capture your facial expressions and classifies them into one of the following emotions:</p>
      <p>Angry, disgust, fear, happy, sad, surprise or neutral.</p>
      <p>Please note that the model was trained on a dataset with exaggerated facial expressions (FER-2013). Therefore, to achieve accurate classifications, you may need to exaggerate your expressions as well.</p>
      <WebcamComponent />
    </>
  );
}
