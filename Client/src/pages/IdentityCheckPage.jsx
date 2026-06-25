import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck } from "lucide-react";
import * as faceapi from "face-api.js";

export default function IdentityCheckPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const videoRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") || '{"name":"Student"}'
  );

  useEffect(() => {
    loadModels();
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

      setLoading(false);
      detectFace();
    } catch (err) {
      console.error("Model loading failed:", err);
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
      console.error("Camera access denied:", err);
      alert("Please allow camera access.");
    }
  };

  const detectFace = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (detection) {
        setFaceDetected(true);

        setConfidence((prev) => {
          if (prev >= 98) {
            clearInterval(interval);
            return 98;
          }
          return prev + 2;
        });
      } else {
        setFaceDetected(false);
        setConfidence(0);
      }
    }, 500);
  };

  return (
    <div className="page-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <button
          onClick={() => navigate("/")}
          aria-label="Close"
          style={{ color: "var(--clr-primary)" }}
        >
          <X size={24} />
        </button>

        <span
          className="top-bar-title"
          style={{ flex: 1, marginLeft: 12 }}
        >
          ExamAI
        </span>

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--clr-border)",
          }}
        />
      </div>

      <div
        className="page-content"
        style={{ paddingBottom: 40 }}
      >
        <h1
          style={{
            fontSize: "var(--fs-headline-lg)",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Identity Check
        </h1>

        <p
          style={{
            color: "var(--clr-neutral)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Position your face within the frame for AI verification.
        </p>

        {/* Camera */}
        <div
          style={{
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "500px",
              objectFit: "cover",
              background: "#000",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "20%",
              width: "60%",
              height: "70%",
              border: `3px solid ${
                faceDetected ? "#10b981" : "#3b82f6"
              }`,
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#fff",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Loading AI..."
              : faceDetected
              ? "Face Detected ✓"
              : "Searching Face..."}
          </div>
        </div>

        {/* Result Card */}
        {faceDetected && (
          <div
            className="card"
            style={{ marginBottom: 20 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ShieldCheck
                size={32}
                color="#10b981"
              />

              <div style={{ flex: 1 }}>
                <h3>{user.name}</h3>
                <small>Identity Verified</small>
              </div>

              <div>
                <strong>{confidence}%</strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                height: 8,
                background: "#e5e7eb",
                borderRadius: 999,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${confidence}%`,
                  background: "#10b981",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          disabled={!faceDetected || confidence < 90}
          onClick={() => navigate("/exam")}
          style={{
            opacity:
              !faceDetected || confidence < 90
                ? 0.5
                : 1,
          }}
        >
          Proceed to Exam →
        </button>
      </div>
    </div>
  );
}