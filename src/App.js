// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [envData, setEnvData] = useState({});
  const [loading, setLoading] = useState(true);

  // Replace with your actual API URL
  const apiUrl = "http://172.29.176.55:5000/api/plc-data"; // 👈 update this!

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setEnvData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="container">
      <h1>Environment Status Dashboard</h1>
      <div className="grid">
        {Object.entries(envData).map(([area, tags]) => (
          <div key={area} className="card">
            <h2>{area.replaceAll("_", " ")}</h2>
            <p>🌡️ Temp: {tags[`${area}_TEMPERATURE`] ?? "N/A"} °C</p>
            <p>💧 Humidity: {tags[`${area}_HUMIDITY`] ?? "N/A"} %</p>
            {`${area}_STATUS` in tags && (
              <p>
                ⚙️ Status:{" "}
                <span
                  className={
                    tags[`${area}_STATUS`] === 0 ? "status-ok" : "status-fail"
                  }
                >
                  {tags[`${area}_STATUS`] === 0 ? "OK" : "ALERT"}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
