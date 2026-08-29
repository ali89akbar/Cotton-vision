// PlantGallery.js
import React from "react";
import './plantgallery.css'
import { useNavigate } from "react-router-dom";

const plantModels = [
  { name: "Tomato", modelPath: "/tomato/scene.gltf" },
  { name: "Apple", modelPath: "/apple-tree/scene.gltf" },
  { name: "Rose", modelPath: "/rose/scene.gltf" },
];

const PlantGallery = () => {
  const navigate = useNavigate();

  const handleClick = (modelPath) => {
    navigate(`/ar-viewer?model=${encodeURIComponent(modelPath)}`);
  };

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
