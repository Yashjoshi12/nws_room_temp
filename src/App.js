import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.jpg"; // adjust path if needed

const dataUrl = "http://172.29.176.55:5000/api/plc-data";
const groupUrl = "http://172.29.176.55:5000/api/area-groups";

function App() {
  const [envData, setEnvData] = useState({});
  const [areaGroups, setAreaGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(dataUrl).then((res) => res.json()),
      fetch(groupUrl).then((res) => res.json()),
    ])
      .then(([dataRes, groupRes]) => {
        setEnvData(dataRes);
        setAreaGroups(groupRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  // Poll envData every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(dataUrl)
        .then((res) => res.json())
        .then((dataRes) => setEnvData(dataRes))
        .catch((err) => console.error("Polling error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="Company Logo" className="company-logo" />
      </div>

      <h1>NETWORK ROOMS ENVIRONMENTAL MONITORING</h1>

      <div className="grid">
        {Object.entries(areaGroups).map(([areaKey, meta]) => {
          const tags = envData[areaKey] || {};
          const status = tags[`${areaKey}_STATUS`];

          const isAlert = status !== undefined && status !== 0;

          return (
            <div
              key={areaKey}
              className={`card ${isAlert ? "alert" : ""}`}
            >
              <h2>{meta.display_name}</h2>

              <div className="value-row">
                <span className="symbol">🌡️</span>
                <span className="value">
                  {tags[`${areaKey}_TEMPERATURE`] != null
                    ? `${parseFloat(tags[`${areaKey}_TEMPERATURE`]).toFixed(1)} °C`
                    : "N/A"}
                </span>
              </div>

              <div className="value-row">
                <span className="symbol">💧</span>
                <span className="value">
                  {tags[`${areaKey}_HUMIDITY`] != null
                    ? `${tags[`${areaKey}_HUMIDITY`]} %`
                    : "N/A"}
                </span>
              </div>

              {isAlert && (
                <div className="alert-label">
                  ⚠️ Alert
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="footer-note">
        Designed and developed by CMS Team TML-LKO
      </div>
    </div>
  );
}

export default App;