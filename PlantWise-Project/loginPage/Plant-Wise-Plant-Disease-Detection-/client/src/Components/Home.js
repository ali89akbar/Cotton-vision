import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiAperture, FiCloudRain, FiCpu, FiCheckCircle, FiShield } from 'react-icons/fi';
import { FaLeaf, FaFlask, FaCloudSun, FaShieldAlt, FaSeedling } from 'react-icons/fa';
import FeaturesShowcase from './FeaturesShowcase';
import AiIntelligence from './AiIntelligence';
import Testimonials from './Testimonials';
import FaqSection from './FaqSection';
import './home.css';

const Home = () => {
  return (
    <div className="plantwise-container">
      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `url('/assets/images/home4-slider-03.jpg')` }}
      >
        <div className="hero-overlay"></div>

        {/* Hero Bottom Features Strip */}
        <div className="hero-bottom-container">
          <div className="hero-bottom-features">
            <div className="hero-feature">
              <div className="hero-feature-icon-wrapper">
                <FiAperture className="hero-feature-icon" />
              </div>
              <h3 className="hero-feature-title">AI Leaf Disease Diagnostics</h3>
              <p className="hero-feature-sub">6 Pathogens & MobileNetV2 Precision</p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon-wrapper">
                <FiCloudRain className="hero-feature-icon" />
              </div>
              <h3 className="hero-feature-title">Sindh Real-Time Weather Guard</h3>
              <p className="hero-feature-sub">Live Wind Drift & Spray Safety Protection</p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon-wrapper">
                <FiCpu className="hero-feature-icon" />
              </div>
              <h3 className="hero-feature-title">Multi-Lingual Qwen AI Engine</h3>
              <p className="hero-feature-sub">Urdu, Sindhi & Regional Advisory</p>
            </div>

            <div className="hero-feature">
              <div className="hero-feature-icon-wrapper">
                <FiCheckCircle className="hero-feature-icon" />
              </div>
              <h3 className="hero-feature-title">Per-Acre Spray & Care Plans</h3>
              <p className="hero-feature-sub">Exact Pesticide Formulations & Dosage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart AI Crop Care Section */}
      <section className="crop-care-section">
        <div className="crop-care-container">
          <div className="crop-care-content">
            <div className="top-tagline">
              <FaLeaf className="tagline-icon" />
              <span>PLANTWISE AI</span>
            </div>

            <h2 className="crop-care-heading">
              Smart AI Crop Care For A Better Harvest
            </h2>

            <p className="crop-care-subtext">
              Instantly detect crop diseases by simply uploading a photo. Get timely treatment recommendations and weather alerts to protect your yield and save costs.
            </p>

            <div className="crop-care-divider"></div>

            <div className="crop-care-stats">
              <div className="stat-column">
                <h3 className="stat-number">95%+</h3>
                <p className="stat-label">AI Accuracy</p>
              </div>
              <div className="stat-column">
                <h3 className="stat-number">24/7</h3>
                <p className="stat-label">WhatsApp Support</p>
              </div>
              <div className="stat-column">
                <h3 className="stat-number">3</h3>
                <p className="stat-label">Major Crops Supported</p>
              </div>
            </div>

            <div className="crop-care-cta">
              <NavLink to="/dashboard" className="crop-care-btn">
                <div className="btn-icon-wrapper">
                  <FiAperture />
                </div>
                <span>Scan Your Crop</span>
              </NavLink>
            </div>
          </div>

          <div className="crop-care-image-wrapper">
            <img 
              src="/assets/images/78522ad5-4b91-43c2-8182-67239aff50a7.png" 
              alt="Smart AI Crop Care" 
              className="crop-care-image"
            />
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <FeaturesShowcase />

      {/* How PlantWise Works Section */}
      <section className="how-it-works" id="howworks">
        {/* Pure Transparent Floating Plant & Leaf Animation Loop */}
        <div className="howworks-bg-overlay transparent-plant-bg">
          <div className="plant-float-leaf leaf-1"><FaLeaf /></div>
          <div className="plant-float-leaf leaf-2"><FaSeedling /></div>
          <div className="plant-float-leaf leaf-3"><FaLeaf /></div>
          <div className="plant-float-leaf leaf-4"><FaSeedling /></div>
          <div className="plant-float-leaf leaf-5"><FaLeaf /></div>

          <div className="spore-particle sp1"></div>
          <div className="spore-particle sp2"></div>
          <div className="spore-particle sp3"></div>
          <div className="spore-particle sp4"></div>
          <div className="spore-particle sp5"></div>
          <div className="spore-particle sp6"></div>
        </div>

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

      {/* AI Intelligence Section */}
      <AiIntelligence />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FaqSection />

      {/* Final CTA with Video Background Loop */}
      <section className="final-cta">
        <video 
          className="cta-bg-video" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/assets/images/12315473_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="cta-video-overlay"></div>
        <div className="cta-content">
          <h2>Ready to Diagnose Your Crops?</h2>
          <NavLink to="/dashboard" className="primary-btn large">
            Open AI Leaf Scanner Now
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default Home;