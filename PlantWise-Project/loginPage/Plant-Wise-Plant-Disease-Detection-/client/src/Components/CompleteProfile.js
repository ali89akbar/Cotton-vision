import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaUserCheck, FaLock } from 'react-icons/fa';
import { FiUser, FiPhone, FiMapPin, FiLayers, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_CROPS = [
  { id: 'Cotton', labelEn: 'Cotton', labelUr: 'کپاس', icon: '🌱' },
  { id: 'Potato', labelEn: 'Potato', labelUr: 'آلو', icon: '🥔' },
  { id: 'Tomato', labelEn: 'Tomato', labelUr: 'ٹماٹر', icon: '🍅' },
  { id: 'Wheat', labelEn: 'Wheat', labelUr: 'گندم', icon: '🌾' },
  { id: 'Rice', labelEn: 'Rice', labelUr: 'چاول', icon: '🌾' },
  { id: 'Sugarcane', labelEn: 'Sugarcane', labelUr: 'گنا', icon: '🎋' },
];

const SINDH_DISTRICTS = [
  'Khairpur',
  'Sukkur',
  'Ghotki',
  'Nawabshah (Shaheed Benazirabad)',
  'Naushahro Feroze',
  'Sanghar',
  'Mirpur Khas',
  'Hyderabad',
  'Matiari',
  'Tando Allahyar',
  'Gambat',
  'Larkana',
  'Shikarpur'
];

const CompleteProfile = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    city: 'Khairpur',
    landSize: ''
  });

  // Multi-select Crops State
  const [selectedCrops, setSelectedCrops] = useState(['Cotton']);

  // Smart Autocomplete State for District & City
  const [citySearchTerm, setCitySearchTerm] = useState('Khairpur');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(59);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Click Outside Listener to close City Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleSendOtp = () => {
    if (!formData.whatsappNumber || formData.whatsappNumber.length < 10) {
      setOtpError('Please enter a valid WhatsApp number first.');
      return;
    }
    setOtpError('');
    setOtpSent(true);
    setTimer(59);
    setIsTimerActive(true);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.substring(value.length - 1);
    setOtpDigits(newOtp);

    // Auto focus next box
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto verification when 4 digits entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 4) {
      if (fullCode === '1234' || fullCode.length === 4) {
        setIsVerified(true);
        setOtpSent(false);
        setOtpError('');
      } else {
        setOtpError('Invalid OTP code. Use 1234 for demo verification.');
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const toggleCropSelection = (cropId) => {
    if (selectedCrops.includes(cropId)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter(c => c !== cropId));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropId]);
    }
  };

  // City Search & Selection Handlers
  const handleCityInputChange = (e) => {
    const val = e.target.value;
    setCitySearchTerm(val);
    setFormData({ ...formData, city: val });
    setShowCityDropdown(true);
  };

  const handleSelectCity = (districtName) => {
    setCitySearchTerm(districtName);
    setFormData({ ...formData, city: districtName });
    setShowCityDropdown(false);
  };

  const filteredDistricts = SINDH_DISTRICTS.filter(district =>
    district.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) return;

    const profileData = {
      ...formData,
      crops: selectedCrops,
      mainCrop: selectedCrops[0] || 'Cotton',
      isProfileComplete: true,
      isWhatsappVerified: true
    };
    localStorage.setItem('plantwise_user_profile', JSON.stringify(profileData));
    navigate('/dashboard');
  };

  const isPhoneValid = formData.whatsappNumber.replace(/\D/g, '').length >= 10;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8.5rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem', background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 50%, #e2e8f0 100%)' }}>
      
      {/* Spacious Single-Column Form Card (max-w-4xl) */}
      <div 
        style={{ 
          maxWidth: '896px', 
          margin: '0 auto', 
          background: '#ffffff', 
          borderRadius: '32px', 
          padding: '3rem 2.5rem', 
          boxShadow: '0 25px 50px -12px rgba(5, 150, 105, 0.08)', 
          border: '1px solid rgba(209, 250, 229, 0.8)', 
          transition: 'all 0.3s ease' 
        }}
      >
        
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(240, 253, 244, 0.95)', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '50px', padding: '6px 18px', marginBottom: '1rem' }}>
            <FaUserCheck /> ONBOARDING & FARM SETTINGS
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '2.5rem', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Complete Your Farmer Profile
          </h1>

          <div style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.35rem', color: '#059669', marginBottom: '8px', lineHeight: 1.8 }}>
            اپنا کسان پروفائل مکمل کریں
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Help us customize your weather alerts and AI diagnostics by providing your farm details.
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* FIELD 1: FULL NAME */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <span>Full Name</span>
              <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>پورا نام</span>
            </label>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiUser style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.2rem' }} />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Muhammad Ali Khan"
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: "'DM Sans', sans-serif"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* FIELD 2: WHATSAPP NUMBER WITH INLINE OTP VERIFICATION */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <span>WhatsApp Number (for auto-alerts)</span>
              <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>واٹس ایپ نمبر</span>
            </label>

            <div 
              style={{ 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center',
                borderRadius: '14px',
                border: isVerified ? '2px solid #059669' : '1.5px solid #e2e8f0',
                background: isVerified ? '#f0fdf4' : '#f8fafc',
                transition: 'all 0.3s ease'
              }}
            >
              <FiPhone style={{ position: 'absolute', left: '16px', color: isVerified ? '#059669' : '#64748b', fontSize: '1.2rem' }} />
              
              <input
                type="text"
                required
                disabled={isVerified}
                value={formData.whatsappNumber}
                onChange={(e) => {
                  setFormData({ ...formData, whatsappNumber: e.target.value });
                  setOtpError('');
                }}
                placeholder="+92 300 1234567"
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: '14px',
                  border: 'none',
                  paddingLeft: '48px',
                  paddingRight: '140px',
                  fontSize: '0.95rem',
                  color: isVerified ? '#064e3b' : '#0f172a',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: isVerified ? 700 : 400,
                  fontFamily: "'DM Sans', sans-serif"
                }}
              />

              {/* ACTION RIGHT BUTTON / BADGE */}
              <div style={{ position: 'absolute', right: '10px' }}>
                {isVerified ? (
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      padding: '6px 14px',
                      borderRadius: '50px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)'
                    }}
                  >
                    <span>✅ Verified / تصدیق شدہ</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isPhoneValid || otpSent}
                    onClick={handleSendOtp}
                    style={{
                      background: isPhoneValid ? (otpSent ? '#e2e8f0' : '#f1f5f9') : '#f1f5f9',
                      color: isPhoneValid ? '#059669' : '#94a3b8',
                      border: '1px solid #cbd5e1',
                      padding: '7px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: isPhoneValid ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (isPhoneValid && !otpSent) {
                        e.currentTarget.style.background = '#d1fae5';
                        e.currentTarget.style.borderColor = '#6ee7b7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isPhoneValid && !otpSent) {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                  >
                    {otpSent ? 'Code Sent / کوڈ بھیجا گیا' : 'Send OTP / کوڈ بھیجیں'}
                  </button>
                )}
              </div>
            </div>

            {/* OTP INPUT SECTION (Framer-Motion Slide-Down) */}
            <AnimatePresence>
              {otpSent && !isVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '20px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>
                      Enter 4-Digit OTP Code (Demo Code: <strong>1234</strong>)
                    </span>
                    <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: '1rem', color: '#059669' }}>
                      ایس ایم ایس پر موصول ہونے والا 4 ہندسوں کا کوڈ درج کریں
                    </span>
                  </div>

                  {/* 4 Square Input Boxes */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '1rem 0' }}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-box-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={{
                          width: '48px',
                          height: '48px',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#064e3b',
                          borderRadius: '12px',
                          border: '2px solid #a7f3d0',
                          background: '#ffffff',
                          outline: 'none',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#059669';
                          e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#a7f3d0';
                          e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)';
                        }}
                      />
                    ))}
                  </div>

                  {/* Error & Timer Info */}
                  <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#475569' }}>
                    {otpError && (
                      <div style={{ color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>
                        ⚠️ {otpError}
                      </div>
                    )}

                    {timer > 0 ? (
                      <span>Enter code sent via SMS. Resend available in <strong>00:{timer < 10 ? `0${timer}` : timer}</strong></span>
                    ) : (
                      <span>
                        Didn't receive the SMS code?{' '}
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Resend OTP / دوبارہ بھیجیں
                        </button>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FIELD 3 & 4: SEARCHABLE DISTRICT & LAND SIZE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Searchable District & City Dropdown */}
            <div ref={cityDropdownRef} style={{ position: 'relative' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                <span>District & City</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>ضلع اور شہر</span>
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiMapPin style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.2rem', zIndex: 1 }} />
                <input
                  type="text"
                  required
                  value={citySearchTerm}
                  onChange={handleCityInputChange}
                  placeholder="Type district or city e.g. Khairpur..."
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  onFocus={(e) => {
                    setShowCityDropdown(true);
                    e.target.style.borderColor = '#059669';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.15)';
                  }}
                />
              </div>

              {/* SEARCHABLE DROPDOWN MENU */}
              {showCityDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
                    maxHeight: '190px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '6px'
                  }}
                >
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map((district) => (
                      <div
                        key={district}
                        onClick={() => handleSelectCity(district)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0fdf4';
                          e.currentTarget.style.color = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        <span>🌾 {district}</span>
                        {citySearchTerm.toLowerCase() === district.toLowerCase() && (
                          <FiCheck style={{ color: '#059669' }} />
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                      No matching district found. You can keep typing your city name.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Total Land Size */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                <span>Total Land Size (Acres)</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>کل رقبہ (ایکڑ)</span>
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiLayers style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.2rem' }} />
                <input
                  type="text"
                  required
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  placeholder="e.g. 15 Acres"
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* FIELD 5: MULTI-SELECT CROPS SECTION (BENTO GRID STYLE) */}
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
              <span>Cultivated Crops (Select Multiple)</span>
              <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>کاشت کی جانے والی فصلیں (ایک سے زیادہ منتخب کریں)</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {AVAILABLE_CROPS.map((crop) => {
                const isSelected = selectedCrops.includes(crop.id);
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => toggleCropSelection(crop.id)}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease',
                      border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      boxShadow: isSelected ? '0 8px 20px rgba(5, 150, 105, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.75rem' }}>{crop.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '1rem', color: isSelected ? '#064e3b' : '#1e293b' }}>
                          {crop.labelEn}
                        </div>
                        <div style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1rem', color: isSelected ? '#059669' : '#64748b', lineHeight: 1.4 }}>
                          {crop.labelUr}
                        </div>
                      </div>
                    </div>

                    <div 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        border: isSelected ? 'none' : '2px solid #cbd5e1', 
                        background: isSelected ? '#059669' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSelected && <FiCheck style={{ strokeWidth: 3 }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON WITH VERIFICATION LOCK */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={!isVerified}
              style={{
                width: '100%',
                height: '56px',
                background: isVerified ? '#059669' : '#cbd5e1',
                color: isVerified ? '#ffffff' : '#64748b',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1.05rem',
                borderRadius: '50px',
                border: 'none',
                cursor: isVerified ? 'pointer' : 'not-allowed',
                boxShadow: isVerified ? '0 8px 25px rgba(5, 150, 105, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (isVerified) {
                  e.currentTarget.style.background = '#047857';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(5, 150, 105, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (isVerified) {
                  e.currentTarget.style.background = '#059669';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.3)';
                }
              }}
            >
              {isVerified ? (
                <>
                  <FaCheckCircle style={{ fontSize: '1.2rem' }} />
                  <span>Save Profile & Go to Dashboard /</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.25rem' }}>پروفائل محفوظ کریں</span>
                </>
              ) : (
                <>
                  <FaLock style={{ fontSize: '1.1rem' }} />
                  <span>Verify WhatsApp Number to Save Profile /</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.2rem' }}>پہلے واٹس ایپ نمبر کی تصدیق کریں</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default CompleteProfile;
