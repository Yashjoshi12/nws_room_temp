import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "./logo.jpg"; // adjust path if needed


function App() {
  const [envData, setEnvData] = useState({});
  const [areaGroups, setAreaGroups] = useState({});
  const [selectedMajorArea, setSelectedMajorArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlert, setHasAlert] = useState(false);

  const dataUrl = "http://localhost:5000/api/plc-data";
  const groupUrl = "http://localhost:5000/api/area-groups";

  // Load area-groups and initial data on first load
  useEffect(() => {
    Promise.all([
      fetch(dataUrl).then((res) => res.json()),
      fetch(groupUrl).then((res) => res.json()),
    ])
      .then(([dataRes, groupRes]) => {
        setEnvData(dataRes);
        setAreaGroups(groupRes);

        const allMajorAreas = Array.from(
          new Set(Object.values(groupRes).map((a) => a.major_area))
        );

        let alertFound = false;
        let firstAlertMajorArea = null;

        for (const [areaKey, meta] of Object.entries(groupRes)) {
          const status = dataRes[areaKey]?.[`${areaKey}_STATUS`];
          if (status !== undefined && status !== 0) {
            alertFound = true;
            firstAlertMajorArea = meta.major_area;
            break;
          }
        }

        if (alertFound) {
          setHasAlert(true);
          setSelectedMajorArea(firstAlertMajorArea);
        } else if (allMajorAreas.length > 0) {
          setSelectedMajorArea(allMajorAreas[0]);
        }

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
        .then((dataRes) => {
          setEnvData(dataRes);

          // Check if alert exists and update lock if needed
          let alertFound = false;
          let firstAlertMajorArea = null;

          for (const [areaKey, meta] of Object.entries(areaGroups)) {
            const status = dataRes[areaKey]?.[`${areaKey}_STATUS`];
            if (status !== undefined && status !== 0) {
              alertFound = true;
              firstAlertMajorArea = meta.major_area;
              break;
            }
          }

          if (alertFound) {
            setHasAlert(true);
            setSelectedMajorArea(firstAlertMajorArea);
          } else {
            setHasAlert(false);
          }
        })
        .catch((err) => console.error("Polling error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [areaGroups]);

  // Auto-rotate major area every 30 seconds (only if healthy)
  useEffect(() => {
    if (hasAlert || !selectedMajorArea) return;

    const interval = setInterval(() => {
      setSelectedMajorArea((prev) => (prev === "WC" ? "EC" : "WC"));
    }, 30000);

    return () => clearInterval(interval);
  }, [hasAlert, selectedMajorArea]);

  if (loading) return <h2>Loading...</h2>;

  const majorAreas = Array.from(
    new Set(Object.values(areaGroups).map((a) => a.major_area))
  );

  const filteredAreas = Object.entries(areaGroups).filter(
    ([, meta]) => meta.major_area === selectedMajorArea
  );

  return (
    <div className="container">
    <div className="header">
      <img src={logo} alt="Company Logo" className="company-logo" />
      
    </div>
    <div className="footer-note">
       Designed and developed by CMS Team TML-LKO
    </div>
 
      <h1>NETWORK ROOMS ENVIRONMENTAL MONITORING</h1>

      {/* Tabs */}
      <div className="tab-buttons">
        {majorAreas.map((major) => (
          <button
            key={major}
            className={`tab-button ${
              selectedMajorArea === major ? "active" : ""
            }`}
            onClick={() => {
              if (!hasAlert) setSelectedMajorArea(major);
            }}
            disabled={hasAlert}
          >
            {major.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid">
        {filteredAreas.map(([areaKey, meta]) => {
          const tags = envData[areaKey] || {};
          const status = tags[`${areaKey}_STATUS`];

          return (
            <div
              key={areaKey}
              className={`card ${status !== 0 && status !== undefined ? "alert" : ""}`}
            >
              <h2>{meta.display_name}</h2>
              <p className="temperature">
                🌡️ Temp:{" "}
                {tags[`${areaKey}_TEMPERATURE`] != null
                  ? `${parseFloat(tags[`${areaKey}_TEMPERATURE`]).toFixed(1)} °C`
                  : "N/A"}
              </p>
              <p>💧 Humidity: {tags[`${areaKey}_HUMIDITY`] ?? "N/A"} %</p>
              {`${areaKey}_STATUS` in tags && (
                <p>
                  ⚙️ Status:{" "}
                  <span
                    className={
                      status === 0 ? "status-ok" : "status-fail"
                    }
                  >
                    {status === 0 ? "OK" : "ALERT"}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
