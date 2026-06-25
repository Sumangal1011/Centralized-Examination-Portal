import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FaceRegisterPage() {
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [faceReady, setFaceReady] = useState(false);
  const [descriptor, setDescriptor] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

      await startCamera();

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      alert("Camera access denied");
    }
  };

  const captureFace = async () => {
    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected");
      return;
    }

    const faceDescriptor = Array.from(
      detection.descriptor
    );

    setDescriptor(faceDescriptor);
    setFaceReady(true);

    console.log("Face Descriptor:", faceDescriptor);
  };

  const saveFace = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      await axios.post(
        "http://localhost:5000/api/auth/register-face",
        {
          uid: user.uid,
          descriptor,
        }
      );

      alert("Face registered successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save face");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Face Registration</h1>

      {loading ? (
        <p>Loading AI Models...</p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="500"
            height="400"
            style={{
              border: "2px solid #ddd",
              borderRadius: "10px",
            }}
          />

          <br />
          <br />

          <button onClick={captureFace}>
            Capture Face
          </button>

          {faceReady && (
            <>
              <p>
                Face detected successfully
              </p>

              <button onClick={saveFace}>
                Save Face
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}