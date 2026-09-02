import React, { useState, useEffect } from "react";
import './plantgallery.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const plantModels = [
  { name: "Tomato", modelPath: "/tomato/scene.gltf" },
  { name: "Apple", modelPath: "/apple-tree/scene.gltf" },
  { name: "Rose", modelPath: "/rose/scene.gltf" },
];

const PlantGallery = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const handleClick = (modelPath) => {
    navigate(`/ar-viewer?model=${encodeURIComponent(modelPath)}`);
  };

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: '7.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)' }}>
        <div style={{ padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: 500, background: '#ffffff', margin: '0 1rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#e6f4ea', color: '#059669', fontSize: 32, marginBottom: 16 }}>
            🎨
          </div>
          <h2 style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.5rem', marginBottom: 10 }}>
            🔒 Registered Farmer Access Only
          </h2>
          <p style={{ marginTop: 10, color: '#475569', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}>
            Please log in with your account to access the 3D & Augmented Reality (AR) Crop Inspection Gallery.
          </p>
          <button
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 30px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/login'}
          >
            🔑 LOGIN TO ACCESS 3D GALLERY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2>Select a Plant to View in AR</h2>
      <div className="plant-grid">
        {plantModels.map((plant) => (
          <div key={plant.name} className="plant-card" onClick={() => handleClick(plant.modelPath)}>
            <img src={`/thumbnails/${plant.name.toLowerCase()}.jpg`} alt={plant.name} />
            <p>{plant.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantGallery;
