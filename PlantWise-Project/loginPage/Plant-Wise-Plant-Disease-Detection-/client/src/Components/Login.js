import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaShieldAlt } from 'react-icons/fa';
import { FiUser, FiLock, FiAperture } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './login.css';

const Login = () => {
  const loginwithgoogle = () => {
    window.open('http://localhost:6005/auth/google/callback', '_self');
  };

  return (
    <div className="login-page">
      {/* 3D Animated Crop & Plantation Background Elements */}
      <div className="login-bg-overlay">
        {/* Floating 3D Leaves */}
        <div className="leaf-3d-1"><FaLeaf /></div>
        <div className="leaf-3d-2"><FaSeedling /></div>
        <div className="leaf-3d-3"><FaLeaf /></div>
        <div className="leaf-3d-4"><FaSeedling /></div>
        <div className="leaf-3d-5"><FaLeaf /></div>

        {/* Glowing Pollen Particles */}
        <div className="login-spore sp-1"></div>
        <div className="login-spore sp-2"></div>
        <div className="login-spore sp-3"></div>
        <div className="login-spore sp-4"></div>
        <div className="login-spore sp-5"></div>
      </div>

      {/* 3D Glassmorphism Login Container */}
      <motion.div 
        className="login-container-3d"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Side: 3D Plantation Graphic Banner */}
        <div className="login-visual-card">
          <div className="visual-badge">
            <FaLeaf /> <span>PLANTWISE AI</span>
          </div>
          <h2>Smart Agriculture Diagnostics</h2>
          <p>Protect your cotton, potato, and tomato crops with real-time AI disease detection and weather safety guardrails.</p>
          
          {/* Pure 3D Animated Vector Crop Radar (No Image) */}
          <div className="visual-illustration-3d">
            <div className="scanner-circle-3d">
              <div className="radar-sweep-3d"></div>
              <FaLeaf className="center-leaf-3d" />
              <div className="scan-node node-1"></div>
              <div className="scan-node node-2"></div>
              <div className="scan-node node-3"></div>
            </div>
            <div className="scanner-badge-text">
              <FaShieldAlt className="shield-icon-3d" />
              <span>AI CROP SCANNER ONLINE</span>
            </div>
          </div>

          <div className="visual-footer-stats">
            <div className="v-stat">
              <strong>95%+</strong>
              <span>Accuracy</span>
            </div>
            <div className="v-stat">
              <strong>Instant</strong>
              <span>Diagnosis</span>
            </div>
            <div className="v-stat">
              <strong>24/7</strong>
              <span>WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-card">
          <div className="form-header">
            <div className="form-logo-icon">
              <FiAperture />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your farm advisory dashboard</p>
          </div>

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <FiUser className="input-icon" />
              <input type="text" placeholder="Username or Email" required />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input type="password" placeholder="Password" required />
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <div className="or-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button className="login-with-google-btn" onClick={loginwithgoogle}>
            <FcGoogle className="google-icon" />
            <span>Sign In With Google</span>
          </button>

          <p className="message">
            New to PlantWise? <Link to="/register" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s' }}>Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;