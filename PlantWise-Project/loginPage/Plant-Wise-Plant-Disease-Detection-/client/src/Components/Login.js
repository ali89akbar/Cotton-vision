import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaShieldAlt } from 'react-icons/fa';
import { FiUser, FiLock, FiAperture } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginUser, getAuthError } from '../Services/authService';
import { useNotification } from './NotificationContext';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [searchParams] = useSearchParams();
  const googleReportedRef = useRef(false);

  // A Google attempt that failed comes back as /login?error=...&reason=...
  // (the server puts the technical cause in `reason`; it goes to the console so
  // the farmer only sees a readable message).
  useEffect(() => {
    const code = searchParams.get('error');
    if (!code || googleReportedRef.current) return;
    googleReportedRef.current = true;

    const reason = searchParams.get('reason');
    if (reason) console.error('[google-oauth]', reason);

    notify.error(
      code === 'google_denied'
        ? 'Google sign-in was cancelled.'
        : 'Google sign-in could not be completed. Please sign in with your email, or check the server console for the reason.'
    );
    // Clear the query so a refresh does not repeat the message.
    navigate('/login', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same two inputs as before - only wired up now, nothing re-styled.
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await loginUser({ identifier, password });
      // A farmer who never finished onboarding lands on the profile form.
      navigate(data.requiresProfileCompletion ? '/complete-profile' : '/dashboard');
    } catch (error) {
      const { message } = getAuthError(error);
      notify.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginwithgoogle = () => {
    // /auth/google is the entry point; /auth/google/callback is Google's return
    // route and answers 400 when opened directly.
    window.open('http://localhost:6005/auth/google', '_self');
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center">
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

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="WhatsApp no. or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
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