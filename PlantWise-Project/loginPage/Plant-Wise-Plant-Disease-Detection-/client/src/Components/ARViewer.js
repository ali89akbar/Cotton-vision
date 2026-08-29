import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./ar-viewer.css";

const ARViewer = () => {
  const sceneRef = useRef(null);
  const [arLoaded, setArLoaded] = React.useState(false);
  const [arError, setArError] = React.useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelUrl = queryParams.get("model");

  useEffect(() => {
    if (window.AFRAME && window.ARjs) {
      setArLoaded(true);
    } else {
      setArError("A-Frame or AR.js failed to load.");
    }
  }, []);

  useEffect(() => {
    if (!arLoaded || !sceneRef.current) return;

    const sceneEl = sceneRef.current;
    const handleMarkerFound = (e) => {
      console.log("Marker found:", e.detail);
    };

    sceneEl.addEventListener("markerFound", handleMarkerFound);

    return () => {
      sceneEl.removeEventListener("markerFound", handleMarkerFound);
    };
  }, [arLoaded]);

  if (arError) {
    return (
      <div className="ar-container">
        {/* error UI */}
        <p>{arError}</p>
      </div>
    );
  }

  if (!arLoaded) {
    return (
      <div className="ar-container">
        <p>Loading AR...</p>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="ar-container">
        <p>No model selected. Please go back and choose a plant.</p>
      </div>
    );
  }

  return (
    <div className="ar-container">
      <h1>🌿 View in AR</h1>

      <a-scene
        ref={sceneRef}
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; trackingMethod: best;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true;"
      >
        <a-marker preset="hiro">
          <a-entity
            gltf-model={`url(${modelUrl})`}
            position="0 0 0"
            scale="0.05 0.05 0.05"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
            shadow="type: basic"
          ></a-entity>
        </a-marker>

        <a-entity camera position="0 0 5" near="0.1" far="1000"></a-entity>
        <a-light type="ambient" color="#FFF" intensity="0.8"></a-light>
        <a-light type="directional" color="#FFF" intensity="1.2" position="-2 4 3" cast-shadow></a-light>
      </a-scene>

      <div className="ar-instructions-overlay">
        <div className="instruction-text">Point camera at Hiro marker pattern</div>
      </div>
    </div>
  );
};

export default ARViewer;
