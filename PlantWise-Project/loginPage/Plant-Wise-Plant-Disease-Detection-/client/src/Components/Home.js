import React from 'react';
import { NavLink } from 'react-router-dom';
import './home.css';

const Home = () => {
  return (
    <div className="plantwise-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">Plant<span className="highlight">Wise</span></h1>
          <p className="tagline">Your Smart Plant Care Companion</p>
          <div className="cta-buttons">
            
            <NavLink to="/dashboard" className="primary-btn">Get Started</NavLink>
            <a href='#howworks' className="secondary-btn">See How It Works</a>
          </div>
        </div>
        <div className="hero-image"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Revolutionize Your Plant Care</h2>
        <div className="features-grid">
          {/* Feature 1: Disease Detection */}
          <div className="feature-card">
            <div className="feature-icon disease-detection"></div>
            <h3>Plant Disease Detection</h3>
            <p>Upload photos of your plants to detect diseases early using our advanced AI system.</p>
          </div>

          {/* Feature 2: AR Visualization */}
          <div className="feature-card">
            <div className="feature-icon ar-visualization"></div>
            <h3>AR Visualization</h3>
            <p>See how plants will look in your space before buying with our augmented reality feature.</p>
          </div>

          {/* Feature 3: Care Tracking */}
          <div className="feature-card">
            <div className="feature-icon care-tracking"></div>
            <h3>Personalized Care Tracking</h3>
            <p>Get customized care schedules and reminders tailored to each of your plants.</p>
          </div>

          {/* Feature 4: Gamification */}
          <div className="feature-card">
            <div className="feature-icon gamification"></div>
            <h3>Gamified Experience</h3>
            <p>Earn points, badges, and maintain streaks for consistent plant care.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title" id='howworks'>How PlantWise Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Add Your Plants</h3>
            <p>Create a profile for each plant with species, location, and care details.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Monitor Health</h3>
            <p>Use our AI to scan for diseases and get treatment recommendations.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Follow Care Plan</h3>
            <p>Receive personalized reminders for watering, sunlight, and other needs.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Watch Them Thrive</h3>
            <p>Track progress, earn rewards, and enjoy healthier, happier plants.</p>
          </div>
        </div>
      </section>

      {/* AR Preview Section */}
      <section className="ar-preview">
        <div className="ar-content">
          <h2>Visualize Your Plants in AR</h2>
          <p>See how new plants will look in your space before you buy them. Our AR technology helps you make perfect placement decisions.</p>
          
          <NavLink to="/ar" className="primary-btn">Try AR Now</NavLink>
        </div>
        <model-viewer
          src="/tomato/scene.gltf"
          alt="3D Plant Model"
          auto-rotate
          camera-controls
          ar
          style={{
            width: '50%',
            height: '500px',
            background: '#fff',
            borderRadius: '16px',
          }}
        ></model-viewer>


      </section>

      {/* Community Section */}
      <section className="community-section">
        <h2 className="section-title">Join Our Growing Community</h2>
        <div className="community-stats">
          <div className="stat">
            <h3>10,000+</h3>
            <p>Happy Plant Parents</p>
          </div>
          <div className="stat">
            <h3>50,000+</h3>
            <p>Plants Thriving</p>
          </div>
          <div className="stat">
            <h3>5,000+</h3>
            <p>Diseases Detected</p>
          </div>
        </div>
        <NavLink to="/badge-progress" className="secondary-btn">Share Your Progress</NavLink>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial">
            <p>"PlantWise saved my monstera from root rot! The early detection feature is a game-changer."</p>
            <div className="user">
              <div className="avatar avatar1"></div>
              <span>- Sarah K.</span>
            </div>
          </div>
          <div className="testimonial">
            <p>"I've never been able to keep plants alive before. The care reminders make all the difference!"</p>
            <div className="user">
              <div className="avatar avatar2"></div>
              <span>- Michael T.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Ready to Transform Your Plant Care?</h2>
        <NavLink to="/dashboard" className="primary-btn large">Start Your Plant Journey Today</NavLink>
        {/* <button className="primary-btn large">Start Your Plant Journey Today</button> */}
      </section>
    </div>
  );
};

export default Home;