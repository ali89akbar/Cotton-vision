import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import { FiAperture } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './aiIntelligence.css';

const tabContentData = {
  weather: {
    title: 'Smart Weather',
    image: '/assets/images/rain expected.png',
    paragraph:
      'Our system integrates real-time Open-Meteo data to predict rainfall and floods, alerting farmers on WhatsApp before they spray pesticides.',
    points: [
      'Real-time Rain Forecasts',
      'Prevent Pesticide Washout',
      'Save Operating Costs',
      'Data-Driven Planning',
    ],
  },
  detection: {
    title: 'Early Detection',
    image: '/assets/images/close scanning.png',
    paragraph:
      'Powered by advanced TensorFlow CNN models, PlantWise instantly identifies diseases in cotton, tomato, and potato crops with high precision.',
    points: [
      'Instant WhatsApp Scans',
      'Keras ML Inference',
      'Local Urdu Support',
      'Prevent Crop Loss',
    ],
  },
  savings: {
    title: 'Cost Savings',
    image: '/assets/images/happy farmer.png',
    paragraph:
      'By preventing unnecessary chemical usage and saving crops from timely destruction, we maximize the economic return for local farmers.',
    points: [
      'Higher Yield Margins',
      'Reduce Chemical Waste',
      'Maximize ROI',
      'Save Per-Acre Expenses',
    ],
  },
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 55 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const AiIntelligence = () => {
  const [activeTab, setActiveTab] = useState('weather');
  const currentContent = tabContentData[activeTab];

  return (
    <motion.section
      className="ai-intelligence-section"
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="ai-intelligence-container">
        {/* Left Side: Large Static Image */}
        <div className="ai-intelligence-left">
          <img
            src="/assets/images/farmer check crop.png"
            alt="Farmer checking crop"
            className="ai-large-image"
          />
        </div>

        {/* Right Side: Content & Dynamic Tabs */}
        <div className="ai-intelligence-right">
          {/* Top Tagline */}
          <div className="ai-tagline">
            <FaLeaf className="ai-tagline-icon" />
            <span>AI INTELLIGENCE</span>
          </div>

          {/* Main Heading */}
          <h2 className="ai-heading">
            Automated Disease & Weather Alerts in the Field
          </h2>

          {/* 3 Feature Badges (Green Bubbles) */}
          <div className="ai-tabs-container">
            <button
              className={`ai-tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <span className="tab-dot">•</span> Smart Weather
            </button>
            <button
              className={`ai-tab-btn ${activeTab === 'detection' ? 'active' : ''}`}
              onClick={() => setActiveTab('detection')}
            >
              <span className="tab-dot">•</span> Early Detection
            </button>
            <button
              className={`ai-tab-btn ${activeTab === 'savings' ? 'active' : ''}`}
              onClick={() => setActiveTab('savings')}
            >
              <span className="tab-dot">•</span> Cost Savings
            </button>
          </div>

          <div className="ai-divider"></div>

          {/* Dynamic Sub-section Content */}
          <div className="ai-dynamic-content fade-in-tab" key={activeTab}>
            {/* Small Dynamic 1:1 Aspect Ratio Image */}
            <div className="ai-small-image-wrapper">
              <img
                src={currentContent.image}
                alt={currentContent.title}
                className="ai-small-image"
              />
            </div>

            {/* Details Paragraph & 4 Key Points */}
            <div className="ai-details-wrapper">
              <p className="ai-description-text">{currentContent.paragraph}</p>
              <ul className="ai-points-list">
                {currentContent.points.map((point, index) => (
                  <li key={index} className="ai-point-item">
                    <span className="rocket-icon">🚀</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="ai-cta-wrapper">
            <NavLink to="/dashboard" className="ai-cta-btn">
              <div className="ai-btn-icon">
                <FiAperture />
              </div>
              <span>Scan Your Crop</span>
            </NavLink>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AiIntelligence;
