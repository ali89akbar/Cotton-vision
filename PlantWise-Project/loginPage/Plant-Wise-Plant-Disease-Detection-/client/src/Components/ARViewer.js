import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./ar-viewer.css";

const ARViewer = () => {
  const sceneRef = useRef(null);
  const [arLoaded, setArLoaded] = useState(false);
  const [arError, setArError] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelUrl = queryParams.get("model");

  useEffect(() => {
    axios.get('http://localhost:6005/login/sucess', { withCredentials: true })
      .then(res => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
        setAuthLoading(false);
      })
      .catch(() => {
        setAuthLoading(false);
      });
  }, []);

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

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: '7.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)' }}>
        <div style={{ padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: 500, background: '#ffffff', margin: '0 1rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#e6f4ea', color: '#059669', fontSize: 32, marginBottom: 16 }}>
            📷
          </div>
          <h2 style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.5rem', marginBottom: 10 }}>
            🔒 Registered Farmer Access Only
          </h2>
          <p style={{ marginTop: 10, color: '#475569', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}>
            Please log in with your account to access 3D AR Camera viewing.
          </p>
          <button
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 30px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/login'}
          >
            🔑 LOGIN TO ACCESS AR VIEWER
          </button>
        </div>
      </div>
    );
  }

  if (arError) {
    return (
      <div className="ar-container">
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
