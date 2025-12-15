import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";
import Tesseract from "tesseract.js";

interface QRScannerProps {
  onSerialFound: (serialNumber: string) => void;
  onError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSerialFound, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ocrWorkerRef = useRef<Tesseract.Worker | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualSerial, setManualSerial] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [ocrAttempts, setOcrAttempts] = useState(0);
  const [isOcrReady, setIsOcrReady] = useState(false);
  const enableOCR = false;

  // Initialize OCR worker when component mounts
  useEffect(() => {
    const initOCR = async () => {
      try {
        ocrWorkerRef.current = await Tesseract.createWorker("eng");
        await ocrWorkerRef.current.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        });
        setIsOcrReady(true);
      } catch (error) {
        console.warn("OCR initialization failed:", error);
      }
    };

    initOCR();

    // Cleanup OCR worker on unmount
    return () => {
      if (ocrWorkerRef.current) {
        ocrWorkerRef.current.terminate();
      }
    };
  }, []);

  // OCR fallback function
  const tryOCR = async (canvas: HTMLCanvasElement) => {
    if (!enableOCR || !ocrWorkerRef.current || !isOcrReady) return false;

    try {
      setOcrAttempts((prev) => prev + 1);

      const {
        data: { text },
      } = await ocrWorkerRef.current.recognize(canvas);
      const serial = formatSerial(text);

      if (serial) {
        onSerialFound(serial);
        setIsScanning(false);
        return true;
      }
    } catch (error) {
      console.warn("OCR processing failed:", error);
    }

    return false;
  };

  // Simple continuous scanning loop
  useEffect(() => {
    if (!isScanning) return;

    const scan = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.videoWidth === 0) {
        requestAnimationFrame(scan);
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      setScanCount((prev) => prev + 1);

      try {
        // Try native BarcodeDetector first
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector({
            formats: ["qr_code"],
          });
          try {
            const codes = await detector.detect(canvas);
            if (codes.length > 0) {
              onSerialFound(formatSerial(codes[0].rawValue));
              setIsScanning(false);
              return;
            }
          } catch (e) {
            // Silent fallback to jsQR
          }
        }

        // Fallback to jsQR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          onSerialFound(formatSerial(code.data));
          setIsScanning(false);
          return;
        }

        // OCR fallback - try every 30 frames (about once per second at 30fps)
        if (isOcrReady && scanCount > 60 && scanCount % 30 === 0) {
          const ocrSuccess = await tryOCR(canvas);
          if (ocrSuccess) return;
        }
      } catch (err) {
        console.error("Scan error:", err);
      }

      if (isScanning) requestAnimationFrame(scan);
    };

    requestAnimationFrame(scan);
  }, [isScanning, onSerialFound, scanCount, isOcrReady]);

  const formatSerial = (qrData: string): string => {
    return qrData.trim().toUpperCase();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        setScanCount(0);
        setOcrAttempts(0);
      }
    } catch (err) {
      onError?.(`Camera access failed: ${err}`);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    setScanCount(0);
    setOcrAttempts(0);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formatSerial(manualSerial)) {
      onSerialFound(formatSerial(manualSerial));
      setManualSerial("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {/* Camera Section */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          aspectRatio: "1",
          backgroundColor: "#000",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: isScanning ? "block" : "none",
          }}
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isScanning && (
          <>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60%",
                height: "60%",
                border: "3px solid #00ff88",
                borderRadius: "8px",
                boxShadow: "0 0 0 200px rgba(0,0,0,0.6)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                gap: "8px",
              }}
            >
              <span>Frames: {scanCount}</span>
              {ocrAttempts > 0 && <span>OCR: {ocrAttempts}</span>}
            </div>
          </>
        )}

        {!isScanning && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "#888",
              fontSize: "48px",
            }}
          >
            📱
          </div>
        )}
      </div>

      <button
        onClick={isScanning ? stopCamera : startCamera}
        style={{
          padding: "12px 32px",
          fontSize: "16px",
          fontWeight: "600",
          backgroundColor: isScanning ? "#ff5722" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isScanning ? "⏹ Stop Scanner" : "📷 Scan QR Code"}
      </button>

      {/* Manual Entry */}
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            textAlign: "center",
            margin: "20px 0 10px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Can't scan? Enter serial number manually:
        </div>

        <form
          onSubmit={handleManualSubmit}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            value={manualSerial}
            onChange={(e) => setManualSerial(e.target.value)}
            placeholder="e.g., EVCS-001234"
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!manualSerial.trim()}
            style={{
              padding: "12px 16px",
              backgroundColor: manualSerial.trim() ? "#4CAF50" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: manualSerial.trim() ? "pointer" : "not-allowed",
            }}
          >
            ✓
          </button>
        </form>
      </div>

      {/* Browser support note */}
      <div
        style={{
          padding: "8px 12px",
          backgroundColor: "#e3f2fd",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#1976d2",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        {!("BarcodeDetector" in window)
          ? "📱 Using fallback QR scanner + OCR for better compatibility"
          : `🔍 QR scanner with OCR fallback ${isOcrReady ? "ready" : "loading..."}`}
      </div>
    </div>
  );
};

export default QRScanner;
