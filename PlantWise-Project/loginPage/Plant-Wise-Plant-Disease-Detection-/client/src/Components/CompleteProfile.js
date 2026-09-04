import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  // Edit Mode Flag (true if profile already existed)
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

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
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to format WhatsApp number with Pakistan country code (92)
  const formatWhatsAppNumber = (rawNumber) => {
    if (!rawNumber) return '';
    let digits = rawNumber.toString().replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '92' + digits.slice(1);
    } else if (!digits.startsWith('92') && digits.length === 10) {
      digits = '92' + digits;
    }
    return digits;
  };

  // PRE-FILL EXISTING USER DATA (FROM BACKEND + LOCALSTORAGE)
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        setLoadingInitial(true);
        let existingUser = null;

        // 1. Try fetching from Backend API
        try {
          const res = await axios.get('http://localhost:6005/api/user/profile', { withCredentials: true });
          if (res.data && res.data.user) {
            existingUser = res.data.user;
          }
        } catch (backendErr) {
          // Fallback to /login/sucess
          try {
            const authRes = await axios.get('http://localhost:6005/login/sucess', { withCredentials: true });
            if (authRes.data && authRes.data.user) {
              existingUser = authRes.data.user;
            }
          } catch (e) {}
        }

        // 2. Fallback to localStorage
        if (!existingUser || !existingUser.whatsappNumber) {
          const localSaved = localStorage.getItem('plantwise_user_profile');
          if (localSaved) {
            try {
              existingUser = { ...existingUser, ...JSON.parse(localSaved) };
            } catch (e) {}
          }
        }

        // 3. Pre-populate form fields
        if (existingUser) {
          const name = existingUser.fullName || existingUser.displayName || '';
          const phone = existingUser.whatsappNumber || '';
          const city = existingUser.city || 'Khairpur';
          const land = existingUser.landSize || '';
          const crops = existingUser.crops && existingUser.crops.length > 0 ? existingUser.crops : ['Cotton'];

          setFormData({
            fullName: name,
            whatsappNumber: phone,
            city: city,
            landSize: land
          });
          setCitySearchTerm(city);
          setSelectedCrops(crops);

          if (existingUser.isProfileComplete || phone) {
            setIsEditMode(true);
            setIsVerified(true); // Already verified
          }
        }
      } catch (err) {
        console.error("Error pre-filling profile data:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchExistingProfile();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) return;

    const formattedNumber = formatWhatsAppNumber(formData.whatsappNumber);

    const profileData = {
      ...formData,
      whatsappNumber: formattedNumber,
      crops: selectedCrops,
      mainCrop: selectedCrops[0] || 'Cotton',
      isProfileComplete: true,
      isWhatsappVerified: true
    };

    // 1. Save to backend database via PUT /api/user/profile
    try {
      await axios.put('http://localhost:6005/api/user/profile', {
        fullName: formData.fullName,
        whatsappNumber: formattedNumber,
        city: formData.city,
        landSize: formData.landSize,
        crops: selectedCrops,
      }, { withCredentials: true });
    } catch (saveErr) {
      console.warn("Could not save to backend database, saving locally:", saveErr.message);
    }

    // 2. Save to localStorage & trigger storage event
    localStorage.setItem('plantwise_user_profile', JSON.stringify(profileData));
    window.dispatchEvent(new Event('storage'));

    // 3. WhatsApp Notification Logic: ONLY trigger 'welcome' if this was initial onboarding (NOT an edit)
    if (!isEditMode) {
      const sendWelcomeAlert = async () => {
        try {
          const response = await fetch('http://localhost:6005/api/whatsapp/send-alert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: formattedNumber,
              alertType: 'welcome',
            }),
          });
          const data = await response.json();
          console.log('📱 WhatsApp Welcome Alert Response:', data);
        } catch (waErr) {
          console.warn('⚠️ WhatsApp Welcome Alert Delivery skipped/failed:', waErr.message);
        }
      };

      sendWelcomeAlert();
      setToastMessage('Profile Completed! Check your WhatsApp for a welcome message.');
    } else {
      setToastMessage('Profile updated successfully!');
    }

    setTimeout(() => {
      navigate('/dashboard');
    }, 1600);
  };

  const isPhoneValid = formData.whatsappNumber.replace(/\D/g, '').length >= 10;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8.5rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem', background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 50%, #e2e8f0 100%)', position: 'relative' }}>
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              background: '#064e3b',
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '50px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
              border: '1.5px solid #34d399',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <FaCheckCircle style={{ color: '#34d399', fontSize: '1.2rem' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
            <FaUserCheck /> {isEditMode ? "FARMER PROFILE SETTINGS" : "ONBOARDING & FARM SETTINGS"}
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '2.5rem', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            {isEditMode ? "Manage Your Farmer Profile" : "Complete Your Farmer Profile"}
          </h1>

          <div style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.35rem', color: '#059669', marginBottom: '8px', lineHeight: 1.8 }}>
            {isEditMode ? "اپنا کسان پروفائل اپڈیٹ کریں" : "اپنا کسان پروفائل مکمل کریں"}
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {isEditMode
              ? "Update your phone number, agricultural region, and crop preferences to fine-tune AI advisories."
              : "Help us customize your weather alerts and AI diagnostics by providing your farm details."}
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
                placeholder="e.g. Muhammad Ali"
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
              <span>WhatsApp Number (For Automated Crop Alerts)</span>
              <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>واٹس ایپ نمبر (فصل کے الرٹس کے لیے)</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <FiPhone style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.2rem' }} />
                <input
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, whatsappNumber: e.target.value });
                    if (isVerified && e.target.value !== formData.whatsappNumber) {
                      setIsVerified(false); // require re-verify if number changed
                    }
                  }}
                  placeholder="e.g. 0336 0069977"
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '14px',
                    border: isVerified ? '2px solid #059669' : '1.5px solid #e2e8f0',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    background: isVerified ? '#f0fdf4' : '#f8fafc',
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
                    e.target.style.borderColor = isVerified ? '#059669' : '#e2e8f0';
                    e.target.style.background = isVerified ? '#f0fdf4' : '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Verified Badge or Send OTP Button */}
              {isVerified ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac', borderRadius: '14px', height: '52px', padding: '0 20px', fontWeight: 800, fontSize: '0.88rem' }}>
                  <FaCheckCircle style={{ color: '#16a34a' }} /> Verified
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!isPhoneValid || isTimerActive}
                  onClick={handleSendOtp}
                  style={{
                    height: '52px',
                    padding: '0 24px',
                    borderRadius: '14px',
                    background: isPhoneValid && !isTimerActive ? '#059669' : '#e2e8f0',
                    color: isPhoneValid && !isTimerActive ? '#ffffff' : '#94a3b8',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: isPhoneValid && !isTimerActive ? 'pointer' : 'not-allowed',
                    boxShadow: isPhoneValid && !isTimerActive ? '0 4px 14px rgba(5, 150, 105, 0.25)' : 'none',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isTimerActive ? `Resend in ${timer}s` : 'Verify Number'}
                </button>
              )}
            </div>

            {/* OTP ENTER BOXES (WHEN SENT) */}
            {otpSent && !isVerified && (
              <div style={{ marginTop: '12px', background: '#f8fafc', border: '1.5px dashed #059669', borderRadius: '16px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    Enter 4-digit code sent to WhatsApp:
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                    Demo code: 1234
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '46px',
                        height: '50px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        borderRadius: '12px',
                        border: '2px solid #cbd5e1',
                        background: '#ffffff',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#059669')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  ))}
                </div>

                {otpError && (
                  <div style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                    {otpError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FIELD 3 & 4: 2-COLUMN ROW (DISTRICT & LAND SIZE) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* Smart District & City Dropdown */}
            <div ref={cityDropdownRef} style={{ position: 'relative' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                <span>Agricultural Region / District</span>
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.1rem', color: '#059669' }}>زرعی علاقہ / ضلع</span>
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiMapPin style={{ position: 'absolute', left: '16px', color: '#059669', fontSize: '1.2rem' }} />
                <input
                  type="text"
                  required
                  value={citySearchTerm}
                  onChange={handleCityInputChange}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="Search Sindh district..."
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
                />
              </div>

              {/* Autocomplete Suggestions Menu */}
              {showCityDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                    zIndex: 50,
                    marginTop: '6px',
                    padding: '6px'
                  }}
                >
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map((district, idx) => (
                      <div
                        key={idx}
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
                          background: formData.city === district ? '#f0fdf4' : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = formData.city === district ? '#f0fdf4' : 'transparent')}
                      >
                        <span>{district}</span>
                        {formData.city === district && <FiCheck style={{ color: '#059669' }} />}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                      No matching district found
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
                  <span>{isEditMode ? "Update Profile & Save Changes /" : "Save Profile & Go to Dashboard /"}</span>
                  <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif", fontSize: '1.25rem' }}>
                    {isEditMode ? "پروفائل اپڈیٹ کریں" : "پروفائل محفوظ کریں"}
                  </span>
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
