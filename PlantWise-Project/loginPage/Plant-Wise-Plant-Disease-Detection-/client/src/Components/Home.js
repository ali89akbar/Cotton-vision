import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaLeaf, FaFlask, FaCloudSun, FaShieldAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './home.css';

const Home = () => {
  return (
    <div className="plantwise-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="app-badge">
            <FaShieldAlt /> Hackathon Production Release 2026
          </div>
          <h1 className="app-title">Plant<span className="highlight">Wise</span> Detection</h1>
          <p className="tagline">
            AI-Powered Cotton Disease Classification & Weather-Aware Agronomic Decision Engine for Khairpur & Sindh Farmers.
          </p>
          <div className="cta-buttons">
            <NavLink to="/dashboard" className="primary-btn">
              Launch AI Scanner <FaArrowRight style={{ marginLeft: 8 }} />
            </NavLink>
            <a href="#howworks" className="secondary-btn">How It Works</a>
          </div>
        </div>
        <div className="hero-image"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Precision Agricultural Decision Engine</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-badge">
              <FaLeaf />
            </div>
            <h3>Cotton Disease AI Diagnostics</h3>
            <p>Classifies Aphids, Army worm, Bacterial Blight, Powdery Mildew, Target spot, and Healthy foliage with MobileNetV2.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">
              <FaFlask />
            </div>
            <h3>Per-Acre Spray Dosage</h3>
            <p>Provides exact pesticide formulations, active ingredients, application methods, and per-acre dosages tailored for Sindh.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">
              <FaCloudSun />
            </div>
            <h3>Real-Time Weather Guardrails</h3>
            <p>Integrates OpenWeatherMap API to detect wind drift, heatwaves, and rain risk before recommending pesticide spray.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge">
              <FaShieldAlt />
            </div>
            <h3>70% Low Confidence Safeguard</h3>
            <p>Prevents improper chemical spraying by requesting a clearer photograph if model confidence drops below 70%.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="howworks">
        <h2 className="section-title">How PlantWise Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Select Location</h3>
            <p>Choose your Sindh city or village (e.g. Khairpur, Sukkur, Gambat) to pull live weather.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Upload Leaf Photo</h3>
            <p>Upload a clear photo of the affected cotton leaf into the AI scanner.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Instant AI Diagnosis</h3>
            <p>Receive English & Urdu pathogen identification with confidence score.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Spray & Safety Plan</h3>
            <p>Get exact chemical spray dosages and real-time weather safety status.</p>
          </div>
        </div>
      </section>

      {/* Community & Stats Section */}
      <section className="community-section">
        <h2 className="section-title" style={{ color: 'white' }}>Empowering Sindh Agriculture</h2>
        <div className="community-stats">
          <div className="stat-box">
            <h3>99%+</h3>
            <p>TFLite Edge Precision</p>
          </div>
          <div className="stat-box">
            <h3>6</h3>
            <p>Target Cotton Classes</p>
          </div>
          <div className="stat-box">
            <h3><FaCheckCircle style={{ fontSize: '2.5rem' }} /></h3>
            <p>Weather Safety Guard</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Ready to Diagnose Your Crops?</h2>
        <NavLink to="/dashboard" className="primary-btn large">
          Open AI Leaf Scanner Now
        </NavLink>
      </section>
    </div>
  );
};

export default Home;