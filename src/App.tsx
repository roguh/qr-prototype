import React, { useState } from "react";
import QRScanner from "./QRScanner";
import "./App.css";

function App() {
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [stationInfo, setStationInfo] = useState<any>(null);

  // Mock function to simulate fetching station data
  const fetchStationInfo = async (serial: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data for demo purposes
    const mockStations: Record<string, any> = {
      "EVCS-001234": {
        id: "EVCS-001234",
        location: "Downtown Plaza",
        status: "Available",
        powerOutput: "150kW",
        connector: "CCS",
        price: "$0.35/kWh",
      },
      "EVCS-005678": {
        id: "EVCS-005678",
        location: "Shopping Center",
        status: "In Use",
        powerOutput: "50kW",
        connector: "CHAdeMO",
        price: "$0.28/kWh",
      },
      "EVCS-009999": {
        id: "EVCS-009999",
        location: "Highway Rest Stop",
        status: "Maintenance",
        powerOutput: "350kW",
        connector: "CCS",
        price: "$0.42/kWh",
      },
    };

    return mockStations[serial] || null;
  };

  const handleSerialFound = async (serial: string) => {
    setSerialNumber(serial);
    setError("");
    setStationInfo(null);

    try {
      const info = await fetchStationInfo(serial);
      if (info) {
        setStationInfo(info);
      } else {
        setError(`Station ${serial} not found in database`);
      }
    } catch (err) {
      setError("Failed to fetch station information");
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearResults = () => {
    setSerialNumber("");
    setError("");
    setStationInfo(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "#4CAF50";
      case "in use":
        return "#FF9800";
      case "maintenance":
        return "#f44336";
      default:
        return "#666";
    }
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

      {/* Station Information Display */}
      {stationInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "2px solid #e9ecef",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ margin: 0, color: "#333" }}>Station Details</h3>
            <button
              onClick={clearResults}
              style={{
                padding: "6px 12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Serial Number:</strong>
              <span
                style={{
                  fontFamily: "monospace",
                  backgroundColor: "#e9ecef",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {stationInfo.id}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Location:</strong>
              <span>{stationInfo.location}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>Status:</strong>
              <span
                style={{
                  color: getStatusColor(stationInfo.status),
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(stationInfo.status),
                  }}
                />
                {stationInfo.status}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Power Output:</strong>
              <span>{stationInfo.powerOutput}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Connector:</strong>
              <span>{stationInfo.connector}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Price:</strong>
              <span style={{ fontWeight: "600", color: "#2196F3" }}>
                {stationInfo.price}
              </span>
            </div>
          </div>

          {stationInfo.status === "Available" && (
            <button
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔌 Start Charging Session
            </button>
          )}
        </div>
      )}

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
      {serialNumber && !stationInfo && !error && (
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
            🔍 Looking up station: <strong>{serialNumber}</strong>
          </div>
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
            Please wait...
          </div>
        </div>
      )}

      <QRScanner onSerialFound={handleSerialFound} onError={handleError} />
    </div>
  );
}

export default App;
