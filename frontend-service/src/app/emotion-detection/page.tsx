/* 'use client'

import React, { useRef, useEffect } from 'react';

const WebcamComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;

    const startWebcam = async () => {
      try {
        // Request access to the webcam
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Set the video element's source to the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing the webcam: ', err);
      }
    };

    startWebcam();

    return () => {
      // Clean up the stream when the component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }} />
    </div>
  );
};
 */


export default function Page() {
    return (
        <>
        <h1>Sorry! There&apos;s nothing here yet :(</h1>
        </>
    )
}