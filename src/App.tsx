import React, { useState } from "react";
import QRScanner from "./QRScanner";
import "./App.css";

function App() {
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSerialFound = async (serial: string) => {
    setSerialNumber(serial);
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearResults = () => {
    setSerialNumber("");
    setError("");
  };

  return (
    <div
      className="App"
      style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}
    >
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1>⚡ EV Charger Scanner</h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Scan QR code or enter serial number to view charging station details
        </p>
      </header>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#ffebee",
            borderRadius: "8px",
            border: "1px solid #f44336",
            color: "#d32f2f",
            textAlign: "center",
          }}
        >
          <strong>⚠️ {error}</strong>
        </div>
      )}

      {/* Serial Number Display */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          border: "1px solid #2196F3",
          textAlign: "center",
        }}
      >
        <div>
          <strong>
            {serialNumber ? serialNumber : "No serial number found"}
          </strong>
        </div>
      </div>

      <QRScanner onSerialFound={handleSerialFound} onError={handleError} />
    </div>
  );
}

export default App;
