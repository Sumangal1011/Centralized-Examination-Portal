import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import * as faceapi from "face-api.js";
import { authAPI } from "../utils/api";

export default function IdentityCheckPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [refDescriptor, setRefDescriptor] = useState(null);
  const [refLoading, setRefLoading] = useState(false);
  const [matchStatus, setMatchStatus] = useState("pending"); // pending, matched, rejected
  const [refError, setRefError] = useState("");
  const [noRefPhoto, setNoRefPhoto] = useState(false); // true if no reference photo configured

  const videoRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const refDescriptorVal = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") || '{"name":"Student"}'
  );

  useEffect(() => {
    refDescriptorVal.current = refDescriptor;
  }, [refDescriptor]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authAPI.me();
        setUserProfile(profile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchProfile();
    loadModels();
    startCamera();

    return () => {
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (userProfile && modelsLoaded) {
      // Prefer photoLink, fallback to faceImageLink
      const photoUrl = userProfile.photoLink || userProfile.faceImageLink;
      if (photoUrl && photoUrl.trim()) {
        loadReferenceFace(photoUrl);
      } else {
        // No reference photo — allow through with a warning
        setNoRefPhoto(true);
        setRefError("");
      }
    }
  }, [userProfile, modelsLoaded]);

  const loadReferenceFace = async (link) => {
    setRefLoading(true);
    setRefError("");
    setNoRefPhoto(false);
    try {
      // Use a proxy-friendly approach: create image element first to check if it loads
      const img = await faceapi.fetchImage(link).catch(async () => {
        // Try with a CORS proxy fallback or just the img element
        return new Promise((resolve, reject) => {
          const imgEl = new Image();
          imgEl.crossOrigin = "anonymous";
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = () => reject(new Error("Could not load image"));
          imgEl.src = link;
        });
      });

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setRefDescriptor(detection.descriptor);
        setRefError("");
        console.log("Reference face descriptor loaded successfully");
      } else {
        setRefError("No face detected in reference photo. Proceeding without face matching.");
        setNoRefPhoto(true);
        console.warn("No face detected in reference image — allowing bypass");
      }
    } catch (err) {
      console.error("Error loading reference face:", err);
      setRefError("Could not load reference photo. Proceeding without face matching.");
      setNoRefPhoto(true);
    } finally {
      setRefLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

      setLoading(false);
      setModelsLoaded(true);
      detectIntervalRef.current = detectFace();
    } catch (err) {
      console.error("Model loading failed:", err);
      setLoading(false);
      // Allow bypass if models fail to load
      setNoRefPhoto(true);
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
      alert("Please allow camera access for identity verification.");
    }
  };

  const detectFace = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        const currentRefDescriptor = refDescriptorVal.current;

        if (detection) {
          setFaceDetected(true);

          if (currentRefDescriptor) {
            const distance = faceapi.euclideanDistance(detection.descriptor, currentRefDescriptor);
            console.log("Euclidean distance:", distance);

            if (distance < 0.6) {
              setMatchStatus("matched");
              setConfidence((prev) => {
                if (prev >= 98) return 98;
                return Math.min(98, prev + 5);
              });
            } else {
              setMatchStatus("rejected");
              setConfidence(0);
            }
          } else {
            // No reference descriptor loaded → allow through (bypass mode)
            setMatchStatus("matched");
            setConfidence((prev) => {
              if (prev >= 95) return 95;
              return Math.min(95, prev + 5);
            });
          }
        } else {
          setFaceDetected(false);
          setMatchStatus("pending");
          setConfidence(0);
        }
      } catch (err) {
        // Silently handle detection errors
      }
    }, 500);

    return interval;
  };

  const handleProceed = () => {
    // Capture snapshot from webcam
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      localStorage.setItem("verifiedPhoto", dataUrl);
    }
    // Navigate to exam selection page (not directly to /exam)
    navigate("/exam-select");
  };

  const canProceed = noRefPhoto
    ? (faceDetected || !loading)  // if no ref photo, just need face visible (or bypass)
    : (matchStatus === "matched" && confidence >= 90);

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

        {refLoading && (
          <div style={{ textAlign: "center", color: "var(--clr-neutral)", marginBottom: 12, fontSize: "14px", fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Loading registration photo...
          </div>
        )}

        {refError && (
          <div style={{
            textAlign: "center",
            color: "var(--clr-medium)",
            marginBottom: 12,
            fontSize: "13px",
            fontWeight: 500,
            background: 'var(--clr-medium-bg)',
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
          }}>
            ⚠️ {refError}
          </div>
        )}

        {noRefPhoto && !refLoading && (
          <div style={{
            textAlign: "center",
            color: "var(--clr-ai-blue)",
            marginBottom: 12,
            fontSize: "13px",
            fontWeight: 500,
            background: 'var(--clr-ai-blue-bg)',
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
          }}>
            ℹ️ No reference photo configured. Camera check only — please ensure you are visible.
          </div>
        )}

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
                !faceDetected ? "#3b82f6" : matchStatus === "rejected" ? "#ef4444" : "#10b981"
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
              color: "#0f172a",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {loading
              ? "Loading AI..."
              : refLoading
              ? "Loading profile photo..."
              : !faceDetected
              ? "Searching face..."
              : matchStatus === "rejected"
              ? "Face mismatch ✗"
              : noRefPhoto
              ? "Face visible ✓"
              : "Identity verified ✓"}
          </div>
        </div>

        {/* Result Card */}
        {faceDetected && (
          <div
            className="card"
            style={{
              marginBottom: 20,
              border: `1.5px solid ${matchStatus === "rejected" && !noRefPhoto ? "var(--clr-high)" : "#10b981"}`
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {matchStatus === "rejected" && !noRefPhoto ? (
                <ShieldAlert
                  size={32}
                  color="var(--clr-high)"
                />
              ) : (
                <ShieldCheck
                  size={32}
                  color="#10b981"
                />
              )}

              <div style={{ flex: 1 }}>
                <h3>{user.name}</h3>
                <small style={{ color: matchStatus === "rejected" && !noRefPhoto ? "var(--clr-high)" : "#10b981", fontWeight: 600 }}>
                  {matchStatus === "rejected" && !noRefPhoto
                    ? "REJECTED: Face does not match reference photo"
                    : noRefPhoto
                    ? "Camera check passed"
                    : "Identity Verified"}
                </small>
              </div>

              <div>
                <strong>{matchStatus === "rejected" && !noRefPhoto ? 0 : confidence}%</strong>
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
                  width: `${matchStatus === "rejected" && !noRefPhoto ? 0 : confidence}%`,
                  background: matchStatus === "rejected" && !noRefPhoto ? "var(--clr-high)" : "#10b981",
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          disabled={!canProceed}
          onClick={handleProceed}
          style={{
            opacity: canProceed ? 1 : 0.5,
          }}
        >
          {noRefPhoto ? "Proceed to Exam Selection →" : "Proceed to Exam Selection →"}
        </button>
      </div>
    </div>
  );
}