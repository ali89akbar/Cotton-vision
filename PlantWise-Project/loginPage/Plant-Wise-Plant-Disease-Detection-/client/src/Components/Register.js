import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { FiUser, FiAperture, FiPhone, FiMapPin, FiLayers, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './login.css';

const AVAILABLE_CROPS = [
  { id: 'Cotton', labelEn: 'Cotton', labelUr: 'کپاس', icon: '🌱' },
  { id: 'Potato', labelEn: 'Potato', labelUr: 'آلو', icon: '🥔' },
  { id: 'Tomato', labelEn: 'Tomato', labelUr: 'ٹماٹر', icon: '🍅' },
  { id: 'Wheat', labelEn: 'Wheat', labelUr: 'گندم', icon: '🌾' },
  { id: 'Rice', labelEn: 'Rice', labelUr: 'چاول', icon: '🌾' },
  { id: 'Sugarcane', labelEn: 'Sugarcane', labelUr: 'کماد', icon: '🎋' },
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    city: 'Khairpur',
    landSize: '',
    irrigationSource: 'Canal'
  });

  // Multiple Crops Selection State
  const [selectedCrops, setSelectedCrops] = useState(['Cotton']);

  const toggleCropSelection = (cropId) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profilePayload = {
      ...formData,
      crops: selectedCrops,
      mainCrop: selectedCrops[0] || 'Cotton',
      isProfileComplete: true
    };
    localStorage.setItem('plantwise_user_profile', JSON.stringify(profilePayload));
    navigate('/dashboard');
  };

  const loginwithgoogle = () => {
    window.open('http://localhost:6005/auth/google/callback', '_self');
  };

  return (
    <div className="login-page">
      {/* 3D Animated Background */}
      <div className="login-bg-overlay">
        <div className="leaf-3d-1"><FaLeaf /></div>
        <div className="leaf-3d-2"><FaSeedling /></div>
        <div className="leaf-3d-3"><FaLeaf /></div>
        <div className="leaf-3d-4"><FaSeedling /></div>
        <div className="leaf-3d-5"><FaLeaf /></div>

        <div className="login-spore sp-1"></div>
        <div className="login-spore sp-2"></div>
        <div className="login-spore sp-3"></div>
        <div className="login-spore sp-4"></div>
        <div className="login-spore sp-5"></div>
      </div>

      {/* Main Glassmorphism Form Container */}
      <motion.div 
        className="login-container-3d"
        style={{ maxWidth: '1080px' }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Side Visual Card */}
        <div className="login-visual-card">
          <div className="visual-badge">
            <FaLeaf /> <span>PLANTWISE AI</span>
          </div>
          <h2>Farmer Registration & Profile Setup</h2>
          <p style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: '1.25rem', lineHeight: 1.8, color: '#d1fae5' }}>
            کسان فارم رجسٹریشن اور پروفائل سیٹ اپ
          </p>
          <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '4px' }}>
            Register your crops to get automated WhatsApp spray alerts and localized microclimate diagnostics.
          </p>
          
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
              <span>FARM DATABASE ONLINE</span>
            </div>
          </div>

          <div className="visual-footer-stats">
            <div className="v-stat">
              <strong>Multi-Crop</strong>
              <span>Database</span>
            </div>
            <div className="v-stat">
              <strong>WhatsApp</strong>
              <span>Alerts</span>
            </div>
            <div className="v-stat">
              <strong>Bilingual</strong>
              <span>English / اردو</span>
            </div>
          </div>
        </div>

        {/* Right Side Onboarding Form */}
        <div className="login-form-card" style={{ padding: '2.5rem 2.25rem', overflowY: 'auto', maxHeight: '90vh' }}>
          <div className="form-header" style={{ marginBottom: '1.5rem' }}>
            <div className="form-logo-icon">
              <FiAperture />
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800 }}>
              Complete Farmer Profile
            </h2>
            <p style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669', margin: '2px 0 0 0' }}>
              اپنی فصلوں اور فارم کی معلومات درج کریں
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} style={{ gap: '1.2rem' }}>
            
            {/* FIELD 1: FULL NAME */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                <span>FULL NAME</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", color: '#059669', fontSize: '1rem' }}>پورا نام</span>
              </label>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Muhammad Ali Khan / محمد علی خان" 
                  required 
                />
              </div>
            </div>

            {/* FIELD 2: WHATSAPP NUMBER */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                <span>WHATSAPP MOBILE NUMBER</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", color: '#059669', fontSize: '1rem' }}>واٹس ایپ نمبر</span>
              </label>
              <div className="input-group">
                <FiPhone className="input-icon" />
                <input 
                  type="text" 
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+92 300 1234567" 
                  required 
                />
              </div>
            </div>

            {/* FIELD 3: MULTIPLE CROPS SELECTION */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                <span>CULTIVATED CROPS (SELECT MULTIPLE)</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", color: '#059669', fontSize: '1rem' }}>فصلیں منتخب کریں (ایک سے زیادہ)</span>
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {AVAILABLE_CROPS.map((crop) => {
                  const isSelected = selectedCrops.includes(crop.id);
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCropSelection(crop.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0fdf4' : '#ffffff',
                        color: isSelected ? '#064e3b' : '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(5,150,105,0.12)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700 }}>
                        <span>{crop.icon}</span>
                        <span>{crop.labelEn}</span>
                        {isSelected && <FiCheck style={{ color: '#059669' }} />}
                      </div>
                      <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: '0.9rem', color: isSelected ? '#059669' : '#94a3b8' }}>
                        {crop.labelUr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIELD 4 & 5: CITY & LAND SIZE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  <span>DISTRICT / CITY</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", color: '#059669', fontSize: '0.95rem' }}>ضلع / شہر</span>
                </label>
                <div className="input-group">
                  <FiMapPin className="input-icon" />
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Khairpur, Sukkur..." 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  <span>LAND SIZE (ACRES)</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", color: '#059669', fontSize: '0.95rem' }}>کل رقبہ (ایکڑ)</span>
                </label>
                <div className="input-group">
                  <FiLayers className="input-icon" />
                  <input 
                    type="text" 
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    placeholder="e.g. 15 Acres" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="login-submit-btn" style={{ marginTop: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FaCheckCircle /> Save Profile & Access Dashboard / پروفائل محفوظ کریں
              </span>
            </button>
          </form>

          <div className="or-divider" style={{ margin: '1rem 0 0.5rem 0' }}>
            <span>OR CONTINUE WITH</span>
          </div>

          <button className="login-with-google-btn" onClick={loginwithgoogle}>
            <FcGoogle className="google-icon" />
            <span>Sign In With Google</span>
          </button>

          <p className="message" style={{ marginTop: '1rem' }}>
            Already registered? <Link to="/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
