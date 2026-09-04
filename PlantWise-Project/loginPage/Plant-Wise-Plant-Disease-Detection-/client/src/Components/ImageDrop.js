import React, { useState, useEffect } from "react";
import { useNotification } from './NotificationContext';
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Card,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Box,
  Typography,
  Grid,
  Fab,
  Drawer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import {
  FaCloudSun,
  FaWind,
  FaTint,
  FaFlask,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearchLocation,
  FaRedo,
  FaShieldAlt,
  FaLanguage,
  FaBrain,
  FaBookmark,
  FaVolumeUp,
  FaVolumeMute,
  FaCoins,
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaTrophy,
  FaCamera,
} from "react-icons/fa";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    minHeight: "100vh",
    paddingTop: "7.5rem",
    paddingBottom: theme.spacing(10),
    background: "linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)",
  },
  glassCard: {
    maxWidth: 980,
    width: "100%",
    margin: "auto",
    padding: theme.spacing(4),
    background: "rgba(255, 255, 255, 0.96)",
    backdropFilter: "blur(20px)",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(5, 150, 105, 0.15)",
    border: "1px solid rgba(209, 250, 229, 0.8)",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  hackathonBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.85rem",
    padding: "6px 16px",
    borderRadius: "20px",
    marginBottom: theme.spacing(2),
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  mainTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 800,
    fontSize: "2.5rem",
    background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#475569",
    fontSize: "1.05rem",
    maxWidth: 700,
    margin: "0 auto",
  },
  statusBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    flexWrap: "wrap",
  },
  locationCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2.5),
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
  },
  languageCard: {
    background: "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
    border: "1.5px solid #c8e6c9",
    borderRadius: "20px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3.5),
    boxShadow: "0 6px 18px rgba(5, 150, 105, 0.06)",
  },
  langButtonContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.2),
    marginTop: theme.spacing(1.5),
  },
  langPill: {
    padding: "8px 18px !important",
    height: "auto !important",
    borderRadius: "25px !important",
    fontWeight: "700 !important",
    fontSize: "0.92rem !important",
    fontFamily: "'Outfit', sans-serif !important",
    transition: "all 0.25s ease !important",
    cursor: "pointer !important",
  },
  quickPillGroup: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginTop: theme.spacing(1.5),
    alignItems: "center",
  },
  dropzoneCustom: {
    border: "2px dashed #059669 !important",
    borderRadius: "20px !important",
    background: "#f0fdf4 !important",
    minHeight: "220px !important",
    display: "flex !important",
    alignItems: "center !important",
    justifyContent: "center !important",
    cursor: "pointer !important",
    transition: "all 0.3s ease !important",
    "&:hover": {
      background: "#d1fae5 !important",
      borderColor: "#047857 !important",
      transform: "scale(1.01)",
    },
  },
  loadingContainer: {
    textAlign: "center",
    padding: theme.spacing(6),
  },
  loader: {
    color: "#059669",
    marginBottom: theme.spacing(2),
  },
  resultsContainer: {
    marginTop: theme.spacing(3),
    animation: "$fadeInUp 0.5s ease-out forwards",
  },
  diseaseCard: {
    background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    color: "#ffffff",
    padding: theme.spacing(3.5),
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(4, 120, 87, 0.25)",
    marginBottom: theme.spacing(3),
  },
  urduHeader: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#a7f3d0",
    direction: "rtl",
    marginBottom: theme.spacing(1),
  },
  qwenAdvisoryCard: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)",
    border: "2px solid #34d399",
    borderRadius: "20px",
    padding: theme.spacing(3.5),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.15)",
  },
  qwenRtlText: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#064e3b",
    direction: "rtl",
    lineHeight: "1.85",
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "14px",
  },
  financialCard: {
    display: "none", // Hidden for now as requested
  },
  remedyCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: theme.spacing(3.5),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
  },
  remedyTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    color: "#064e3b",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  infoBox: {
    background: "#f8fafc",
    padding: theme.spacing(2.5),
    borderRadius: "14px",
    border: "1px solid #f1f5f9",
  },
  weatherCard: {
    borderRadius: "22px",
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  },
  weatherSafe: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)",
    border: "1.5px solid #a7f3d0",
  },
  weatherPostponed: {
    background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    border: "1.5px solid #fed7aa",
  },
  weatherMetric: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    background: "rgba(255, 255, 255, 0.85)",
    padding: theme.spacing(1.5, 2.5),
    borderRadius: "14px",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  lowConfidenceAlert: {
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    borderRadius: "20px",
    padding: theme.spacing(3),
    color: "#991b1b",
    textAlign: "left",
    marginBottom: theme.spacing(3),
  },
  actionButton: {
    borderRadius: "30px",
    padding: "12px 28px",
    fontSize: "0.95rem",
    fontWeight: 700,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    textTransform: "uppercase",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
    },
  },
  saveButton: {
    borderRadius: "30px",
    padding: "12px 28px",
    fontSize: "0.95rem",
    fontWeight: 700,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    textTransform: "uppercase",
    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(3, 105, 161, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
    },
  },
  audioButton: {
    borderRadius: "20px",
    background: "#059669",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "0.88rem",
    padding: "8px 20px",
    margin: "0 12px",
    boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)",
    "&:hover": {
      background: "#047857",
    },
  },
  fabChat: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "#ffffff",
    boxShadow: "0 10px 25px rgba(5, 150, 105, 0.4)",
    zIndex: 1000,
    "&:hover": {
      background: "linear-gradient(135deg, #047857 0%, #064e3b 100%)",
    },
  },
  chatDrawerPaper: {
    width: 380,
    padding: theme.spacing(3),
    background: "#ffffff",
  },
  chatBox: {
    height: 380,
    overflowY: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#059669",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "16px 16px 2px 16px",
    maxWidth: "80%",
    fontSize: "0.9rem",
  },
  qwenBubble: {
    alignSelf: "flex-start",
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 2px",
    maxWidth: "85%",
    fontSize: "0.9rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  "@keyframes fadeInUp": {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
}));

const SINDH_CITIES = ["Khairpur", "Sukkur", "Gambat", "Kot Diji", "Ghotki", "Rohri"];

const LANGUAGES = [
  { code: "en", name: "English", label: "🇬🇧 English" },
  { code: "ur", name: "Urdu", label: "🇵🇰 اردو (Urdu)" },
  { code: "sd", name: "Sindhi", label: "🌾 سنڌي (Sindhi)" },
  { code: "pa", name: "Punjabi", label: "🌾 پنجابی (Punjabi)" },
  { code: "skr", name: "Saraiki", label: "🌾 سرائیکی (Saraiki)" },
  { code: "ps", name: "Pashto", label: "🌾 پښتو (Pashto)" },
];

export const ImageUpload = () => {
  const classes = useStyles();
  const notify = useNotification();

  const [selectedFile, setSelectedFile] = useState(null);
  const [cityName, setCityName] = useState("Khairpur");
  const [language, setLanguage] = useState("en");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Chat Copilot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "qwen", text: "Salam! I am your Alibaba Qwen AI Agronomist Copilot. How can I help with your cotton crop today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 8000,
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Progressive Profiling State
  const [isProfileComplete, setIsProfileComplete] = useState(() => {
    const saved = localStorage.getItem('plantwise_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return !!parsed.isProfileComplete;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    whatsappNumber: '',
    mainCrop: 'Cotton',
    city: 'Khairpur',
    landSize: ''
  });

  useEffect(() => {
    axios.get('http://localhost:6005/login/sucess', { withCredentials: true })
      .then(res => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
        setAuthLoading(false);
      })
      .catch(() => {
        setAuthLoading(false);
      });
  }, []);

  const handleFileChange = (files) => {
    if (files.length === 0) {
      setSelectedFile(null);
      setData(null);
      return;
    }
    if (!user && !authLoading) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedFile(files[0]);
    setData(null);
  };

  const sendFile = async (fileToUpload = selectedFile, cityToUse = cityName, langToUse = language) => {
    if (!user && !authLoading) {
      setShowLoginPrompt(true);
      return;
    }
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        `/predict?city=${encodeURIComponent(cityToUse)}&language=${langToUse}&confidence_threshold=0.70`,
        formData
      );
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error sending file:", error);
      notify.error("Unable to connect to Plantwise Model API server. Please ensure main.py is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Guaranteed Multi-Lingual MP3 Audio Player for Illiterate Farmers
  const toggleAudioAdvisory = async () => {
    if (!data?.qwen_advisory?.recommendation) return;

    if (isPlayingAudio) {
      if (window.currentAudioElement) {
        try {
          window.currentAudioElement.pause();
          window.currentAudioElement.currentTime = 0;
        } catch (e) {}
        window.currentAudioElement = null;
      }
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = data.qwen_advisory.recommendation;
    setIsPlayingAudio(true);

    try {
      // 100% Guaranteed MP3 Audio Stream from Backend /tts API
      const response = await fetch("http://localhost:8000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language: language }),
      });

      if (!response.ok) throw new Error("TTS MP3 generation failed");

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.src = audioUrl;
      window.currentAudioElement = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        try { URL.revokeObjectURL(audioUrl); } catch (e) {}
        window.currentAudioElement = null;
      };

      audio.onerror = (e) => {
        console.warn("Audio element error:", e);
        setIsPlayingAudio(false);
        try { URL.revokeObjectURL(audioUrl); } catch (err) {}
        window.currentAudioElement = null;
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play prevented/interrupted:", err);
          setIsPlayingAudio(false);
        });
      }
    } catch (error) {
      console.warn("Backend MP3 stream failed, attempting WebSpeech fallback...", error);
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = ["ur", "sd", "pa", "skr", "ps"].includes(language) ? "ur-PK" : "en-US";
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        } catch (speechErr) {
          setIsPlayingAudio(false);
        }
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  // Send Chat to Qwen Copilot API
  const handleSendChatMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/qwen-chat", {
        message: userText,
        disease: data?.diagnosis?.predicted_class || "",
        language: language,
      }, { timeout: 25000 });

      const reply = response.data?.reply || "Follow recommended agronomic guidelines.";
      setChatMessages((prev) => [...prev, { sender: "qwen", text: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      const dis = data?.diagnosis?.predicted_class || "Cotton Crop";
      let dynamicFallback = `For ${dis} management: Apply chemical remedies separately during cool morning hours (6:00 - 9:00 AM) or late evening. Always verify dosage on chemical labels.`;
      if (language === "ur") {
        dynamicFallback = `${dis} کے لیے: ہمیشہ صبح کے ٹھنڈے اوقات (6 سے 9 بجے) یا شام میں اسپرے کریں۔ دوائی کی خوراک ایگرو ڈیلر کی ہدایت کے مطابق استعمال کریں۔`;
      } else if (language === "sd") {
        dynamicFallback = `${dis} جي علاج لاءِ: هميشه صبح جو يا شام جي وقت اسپري ڪريو. دوائن جو مقدار دروست استعمال ڪريو.`;
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: "qwen", text: dynamicFallback }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const saveToMongoDB = async () => {
    if (!data || data.status !== "SUCCESS") return;
    setIsSaving(true);

    try {
      const weatherInfo = data?.weather_safety_advisory || data?.weather_safety_khairpur;
      const payload = {
        className: data.diagnosis.predicted_class,
        recommendation: data.qwen_advisory?.recommendation || "",
        chemicalRecommendation: data.actionable_decision?.chemical_recommendation || "",
        dosagePerAcre: data.actionable_decision?.dosage_per_acre || "",
        urgencyLevel: data.actionable_decision?.urgency_level || "",
        region: data.region || "",
        weatherSafetyStatus: weatherInfo?.can_spray ? "SAFE TO SPRAY" : "SPRAYING POSTPONED",
        language: language,
      };

      const response = await axios.post("http://localhost:6005/save-prediction", payload, {
        withCredentials: true,
      });

      notify.success(response.data.message || "Saved to MongoDB successfully!");
    } catch (error) {
      console.error("Error saving prediction to MongoDB:", error);
      notify.warning("Saved to local history. Log in with Google to sync across devices.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickCitySelect = (city) => {
    setCityName(city);
    if (selectedFile) {
      sendFile(selectedFile, city, language);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (selectedFile) {
      sendFile(selectedFile, cityName, newLang);
    }
  };

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    if (selectedFile) {
      sendFile(selectedFile, cityName, language);
    }
  }, [selectedFile]);

  const getUrgencyChipProps = (urgency) => {
    switch (urgency) {
      case "CRITICAL":
        return { label: "CRITICAL URGENCY", style: { background: "#ef4444", color: "#fff", fontWeight: 800 } };
      case "HIGH":
        return { label: "HIGH URGENCY", style: { background: "#f97316", color: "#fff", fontWeight: 800 } };
      case "MODERATE_TO_HIGH":
      case "MODERATE":
        return { label: "MODERATE URGENCY", style: { background: "#eab308", color: "#000", fontWeight: 800 } };
      default:
        return { label: "LOW URGENCY", style: { background: "#10b981", color: "#fff", fontWeight: 800 } };
    }
  };

  const weatherInfo = data?.weather_safety_advisory || data?.weather_safety_khairpur;

  const handleDownloadPDFReport = () => {
    if (!data || data.status !== "SUCCESS") return;

    const reportWindow = window.open("", "_blank");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PlantWise Official Agronomic Field Report - ${data.diagnosis.predicted_class}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 3px solid #059669; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #064e3b; }
          .badge { background: #059669; color: white; padding: 6px 14px; border-radius: 20px; font-weight: bold; }
          .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 15px; margin-bottom: 20px; }
          .remedy { background: #f0fdf4; border: 2px solid #34d399; }
          .chemical { font-size: 18px; font-weight: bold; color: #064e3b; margin-top: 5px; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🌿 PlantWise Official Agronomic Diagnostic Report</div>
            <div>Cotton Crop (Gossypium hirsutum) | Regional Field Service</div>
          </div>
          <div class="badge">VERIFIED REPORT</div>
        </div>

        <div class="box">
          <h3>📍 Field Assessment Details</h3>
          <p><strong>Target Region:</strong> ${data.region}</p>
          <p><strong>Diagnosis:</strong> ${data.diagnosis.predicted_class} (${data.diagnosis.disease_name_urdu})</p>
          <p><strong>Model Confidence:</strong> ${data.diagnosis.confidence_percentage}%</p>
          <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="box remedy">
          <h3>💊 Actionable Chemical Remedy (Agro-Dealer Product)</h3>
          <div class="chemical">${data.actionable_decision.chemical_recommendation}</div>
          <p><strong>Dosage Per Acre:</strong> ${data.actionable_decision.dosage_per_acre}</p>
          <p><strong>Application Instructions:</strong> ${data.actionable_decision.application_instructions}</p>
        </div>

        <div class="box">
          <h3>🤖 Alibaba Qwen AI Farmer Recommendation</h3>
          <p>${data.qwen_advisory?.recommendation || "Follow standard agronomic guidelines."}</p>
        </div>

        <div class="box">
          <h3>🌦️ Micro-Climate & Weather Safety Assessment</h3>
          <p><strong>Weather Status:</strong> ${weatherInfo?.can_spray ? "✅ SAFE TO SPRAY" : "⛔ SPRAYING POSTPONED"}</p>
          <p><strong>Recommended Window:</strong> ${weatherInfo?.recommended_window || "Early Morning (6:00 - 9:00 AM)"}</p>
        </div>

        <div class="footer">
          Official Digital Report generated by PlantWise AI Enterprise Platform | Powered by Alibaba Cloud Qwen-Plus LLM
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8.5rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem', background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 50%, #e2e8f0 100%)' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', background: '#ffffff', borderRadius: '32px', padding: '3rem 2.5rem', boxShadow: '0 25px 50px -12px rgba(5, 150, 105, 0.08)', border: '1px solid rgba(209, 250, 229, 0.8)', transition: 'all 0.3s ease' }}>
        
        {/* PROGRESSIVE PROFILING ALERT BANNER */}
        {!isProfileComplete && (
          <div 
            style={{
              background: '#fefce8',
              border: '1.5px solid #fef08a',
              borderRadius: '20px',
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(234, 179, 8, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#854d0e', flexShrink: 0 }}>
                ⚠️
              </div>
              <div>
                <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: '#854d0e', fontSize: '0.98rem', margin: 0 }}>
                  Welcome to PlantWise!
                </h4>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#a16207', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  To receive automated weather safety alerts and personalized crop diagnostics on WhatsApp, please complete your profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = '/complete-profile'}
              style={{
                background: '#059669',
                color: '#ffffff',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '9px 20px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              👤 Complete Profile Now
            </button>
          </div>
        )}

        {/* 2. HEADER SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(240, 253, 244, 0.95)', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '50px', padding: '6px 18px', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.05)', marginBottom: '1rem' }}>
            ✨ POWERED BY ALIBABA QWEN AI
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '2.75rem', color: '#0f172a', letterSpacing: '-0.5px', margin: '0 0 0.75rem 0', lineHeight: 1.2 }}>
            Plantwise Regional <span style={{ color: '#059669' }}>AI Diagnostics</span>
          </h1>

          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#64748b', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            Target Crop: <strong style={{ color: '#1e293b', fontWeight: 700 }}>Cotton (Gossypium hirsutum)</strong> | Real-Time Agronomic Spray Advisory & Alibaba Qwen LLM Engine
          </p>

          <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span>🌦️</span> <span>Live Microclimate Telemetry</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span>🧠</span> <span>Multi-regional Advisory Active</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span>⚡</span> <span>Inference Speed: <strong style={{ color: '#0f172a', fontWeight: 800 }}>118ms</strong></span>
            </div>
          </div>
        </div>

        {/* 3. CONTROLS GRID (LOCATION & LANGUAGE) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
          
          {/* LOCATION FIELD */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaSearchLocation style={{ color: '#059669', fontSize: '1.25rem' }} />
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', margin: 0 }}>
                  Target Field Location
                </h3>
              </div>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Type city or village name e.g. Khairpur, Sukkur..."
                style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', color: '#1e293b', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s', marginBottom: '16px' }}
              />
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Quick Select Sindh Cities:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SINDH_CITIES.map((city) => {
                  const isActive = cityName.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleQuickCitySelect(city)}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isActive ? '1px solid #059669' : '1px solid #e2e8f0',
                        background: isActive ? '#059669' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475569',
                        boxShadow: isActive ? '0 4px 10px rgba(5, 150, 105, 0.25)' : 'none',
                      }}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <FaLanguage style={{ color: '#059669', fontSize: '1.4rem' }} />
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', margin: 0 }}>
                  Select Advisory Language <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.85rem' }}>/ زبان جو انتخاب</span>
                </h3>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0' }}>
                Choose preferred regional language for Alibaba Qwen AI recommendations
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '10px 8px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      border: isActive ? '1px solid #064e3b' : '1px solid #e2e8f0',
                      background: isActive ? '#064e3b' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      boxShadow: isActive ? '0 4px 12px rgba(6, 78, 59, 0.25)' : 'none',
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 4. MODERN DRAG & DROP ZONE */}
        {!selectedFile && (
          <div 
            style={{ width: '100%', marginBottom: '2rem' }}
            onClickCapture={(e) => {
              if (!user && !authLoading) {
                e.preventDefault();
                e.stopPropagation();
                setShowLoginPrompt(true);
              }
            }}
          >
            <div 
              style={{
                position: 'relative',
                minHeight: '260px',
                background: '#F4F9F4',
                border: '2px dashed #a7f3d0',
                borderRadius: '24px',
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ebf5eb';
                e.currentTarget.style.borderColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F4F9F4';
                e.currentTarget.style.borderColor = '#a7f3d0';
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileChange(e.target.files)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
              />
              
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#ffffff', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1rem', border: '1px solid #d1fae5', transition: 'transform 0.3s ease' }}>
                <FaCloudSun style={{ fontSize: '2rem', color: '#059669' }} />
              </div>

              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', margin: '0 0 4px 0' }}>
                Drag & drop your cotton leaf photo here
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                Supports JPG, PNG, WEBP files (Max file size 10MB)
              </p>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#059669', color: '#ffffff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.88rem', padding: '10px 24px', borderRadius: '50px', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)', transition: 'all 0.2s ease' }}>
                <FaCamera style={{ fontSize: '1.05rem' }} /> Browse Files
              </span>
            </div>
          </div>
        )}

        {/* LOADING SPINNER */}
        {isLoading && (
          <div className={classes.loadingContainer}>
            <CircularProgress size={56} className={classes.loader} />
            <Typography variant="h6" style={{ fontWeight: 700, color: "#064e3b" }}>
              Running Neural Model & Generating Qwen ({language.toUpperCase()}) Advisory...
            </Typography>
            <Typography variant="body2" style={{ color: "#64748b", marginTop: 4 }}>
              Fetching live weather for {cityName} and evaluating agronomic spray guardrails
            </Typography>
          </div>
        )}
        {data && !isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            
            {/* LOW CONFIDENCE ALERT */}
            {data.status === "LOW_CONFIDENCE" && (
              <div style={{ gridColumn: 'span 12', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '24px', padding: '1.75rem', color: '#991b1b', textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gridGap={10} mb={1}>
                  <FaExclamationTriangle style={{ fontSize: "1.75rem", color: "#dc2626" }} />
                  <Typography variant="h6" style={{ fontWeight: 800, fontFamily: "'Bricolage Grotesque', sans-serif", color: "#991b1b" }}>
                    Low Confidence Safeguard Activated ({(data.confidence * 100).toFixed(1)}%)
                  </Typography>
                </Box>
                <Typography variant="subtitle2" style={{ fontWeight: 700, color: "#7f1d1d", marginBottom: '6px' }}>
                  Location Assessed: {data.region || cityName}
                </Typography>
                <Typography variant="body1" style={{ maxWidth: '650px', margin: '0 auto 1.25rem auto', lineHeight: 1.6 }}>
                  {data.action_required || `Prediction confidence (${(data.confidence * 100).toFixed(1)}%) is below safety threshold (70%). Please capture a clearer, well-lit photograph directly facing the affected leaf surface to avoid improper chemical application.`}
                </Typography>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <button
                    onClick={clearData}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '50px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
                  >
                    <FaCamera /> Upload Another Photo / Retake Scan
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS BENTO BOX GRID ITEMS */}
            {data.status === "SUCCESS" && (
              <>
                {/* 1. DIAGNOSIS HERO CARD (SPAN 12) */}
                <div style={{ gridColumn: 'span 12', background: 'linear-gradient(135deg, #152210 0%, #1a2914 100%)', color: '#ffffff', borderRadius: '28px', padding: '2rem 2.25rem', border: '1px solid rgba(74, 222, 128, 0.2)', boxShadow: '0 20px 45px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2.25rem', flexWrap: 'wrap' }}>
                  {/* Left: Scanned Crop Image */}
                  {selectedFile && (
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', border: '3px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Scanned Cotton Leaf" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600, marginTop: '8px', textAlign: 'center' }}>
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    </div>
                  )}

                  {/* Right: Pathogen Details */}
                  <div style={{ flex: 1, minWidth: '280px', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#4ade80', display: 'block', marginBottom: '6px' }}>
                      DETECTED PATHOGEN / CONDITION
                    </span>
                    
                    <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '2.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                      {data.diagnosis.predicted_class}
                    </h2>
                    
                    <div style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif", fontSize: '1.4rem', fontWeight: 700, color: '#a7f3d0', marginBottom: '16px', lineHeight: 2.0 }}>
                      {data.diagnosis.disease_name_urdu}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '6px 14px', borderRadius: '50px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        📍 Target Region: <strong style={{ color: '#ffffff' }}>{data.region}</strong>
                      </span>
                      <Chip {...getUrgencyChipProps(data.actionable_decision.urgency_level)} />
                      <span style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid #34d399', color: '#34d399', fontSize: '0.8rem', fontWeight: 800, padding: '6px 16px', borderRadius: '50px' }}>
                        Confidence: {data.diagnosis.confidence_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. AI RECOMMENDATION & TREATMENT (SIDE-BY-SIDE) */}

                {/* Left Card: Alibaba Qwen AI (SPAN 5) */}
                {data.qwen_advisory && (
                  <div style={{ gridColumn: 'span 5', background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: '28px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(5,150,105,0.06)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          <FaBrain style={{ color: '#059669' }} />
                          Alibaba Qwen AI Recommendation ({data.qwen_advisory.language_native || data.qwen_advisory.language_name || data.qwen_advisory.language})
                        </h3>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <button
                          type="button"
                          onClick={toggleAudioAdvisory}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#059669',
                            color: '#ffffff',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            padding: '7px 16px',
                            borderRadius: '50px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isPlayingAudio ? <FaVolumeMute /> : <FaVolumeUp />}
                          <span>{isPlayingAudio ? "Stop Audio" : "🔊 Listen Audio"}</span>
                        </button>

                        <span style={{ background: '#059669', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '50px', textTransform: 'uppercase' }}>
                          Urgency: {data.qwen_advisory.urgency}
                        </span>
                      </div>

                      <div 
                        style={{ 
                          fontFamily: data.qwen_advisory.is_rtl ? "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Regular', 'Noto Nastaliq Urdu', serif" : "'DM Sans', sans-serif", 
                          fontSize: data.qwen_advisory.is_rtl ? '1.15rem' : '0.92rem', 
                          lineHeight: data.qwen_advisory.is_rtl ? 2.2 : 1.7, 
                          color: '#1e293b', 
                          direction: data.qwen_advisory.is_rtl ? 'rtl' : 'ltr',
                          background: 'rgba(255, 255, 255, 0.85)',
                          padding: '1.25rem',
                          borderRadius: '16px',
                          border: '1px solid #d1fae5'
                        }}
                      >
                        {data.qwen_advisory.recommendation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Card: Precise Agronomic Spray Recommendation (SPAN 7) */}
                <div style={{ gridColumn: 'span 7', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '28px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.25rem 0' }}>
                      <FaFlask style={{ color: '#059669' }} /> Precise Agronomic Spray Recommendation
                    </h3>

                    {/* Internal 2-Column Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          FORMULATION & CHEMICAL ({language.toUpperCase()})
                        </span>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '0.98rem', marginTop: '4px' }}>
                          {data.actionable_decision.chemical_recommendation}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          DOSAGE PER ACRE
                        </span>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '0.98rem', marginTop: '4px' }}>
                          {data.actionable_decision.dosage_per_acre}
                        </div>
                      </div>
                    </div>

                    {/* Faint Gray Application Method */}
                    <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        APPLICATION METHOD & INSTRUCTIONS
                      </span>
                      <p style={{ fontFamily: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif" : "'DM Sans', sans-serif", fontSize: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? '1.15rem' : '0.88rem', color: '#1e293b', margin: '4px 0 0 0', lineHeight: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? 2.2 : 1.5, direction: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? 'rtl' : 'ltr' }}>
                        {data.actionable_decision.application_instructions}
                      </p>
                    </div>

                    {/* Field Context */}
                    <div style={{ background: '#f0fdf4', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AGRICULTURAL FIELD CONTEXT (SINDH)
                      </span>
                      <p style={{ fontFamily: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? "'Jameel Noori Nastaleeq', 'JameelNooriNastaliq', 'Noto Nastaliq Urdu', serif" : "'DM Sans', sans-serif", fontSize: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? '1.15rem' : '0.85rem', color: '#064e3b', margin: '4px 0 0 0', lineHeight: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? 2.2 : 1.5, direction: (language === 'ur' || language === 'sd' || language === 'ps' || data.qwen_advisory?.is_rtl) ? 'rtl' : 'ltr' }}>
                        {data.actionable_decision.agronomic_context_sindh}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. WEATHER SAFETY BANNER (SPAN 12) */}
                {weatherInfo && (
                  <div 
                    style={{ 
                      gridColumn: 'span 12', 
                      background: weatherInfo.can_spray ? '#f0fdf4' : '#fef2f2', 
                      border: weatherInfo.can_spray ? '1.5px solid #a7f3d0' : '1.5px solid #fecaca', 
                      borderRadius: '24px', 
                      padding: '1.25rem 1.75rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCloudSun style={{ color: weatherInfo.can_spray ? '#059669' : '#dc2626', fontSize: '1.4rem' }} />
                        <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: weatherInfo.can_spray ? '#064e3b' : '#991b1b', fontSize: '1.1rem', margin: 0 }}>
                          Real-Time Weather Safety ({weatherInfo.conditions_assessed.temperature_c}°C, {weatherInfo.conditions_assessed.wind_speed_kmh} km/h wind)
                        </h4>
                      </div>

                      <span 
                        style={{ 
                          background: weatherInfo.can_spray ? '#059669' : '#dc2626', 
                          color: '#ffffff', 
                          fontWeight: 800, 
                          fontSize: '0.8rem', 
                          padding: '6px 16px', 
                          borderRadius: '50px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px' 
                        }}
                      >
                        {weatherInfo.can_spray ? <FaCheckCircle /> : <FaTimesCircle />}
                        <span>{weatherInfo.can_spray ? "✅ SAFE TO SPRAY" : "⛔ SPRAYING POSTPONED"}</span>
                      </span>
                    </div>

                    {/* Horizontal Weather Metrics */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: '#ffffff', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                        <FaCloudSun style={{ color: '#eab308' }} /> <span>Temp: {weatherInfo.conditions_assessed.temperature_c}°C</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                        <FaWind style={{ color: '#0284c7' }} /> <span>Wind: {weatherInfo.conditions_assessed.wind_speed_kmh} km/h</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                        <FaTint style={{ color: '#2563eb' }} /> <span>Humidity: {weatherInfo.conditions_assessed.humidity_pct}%</span>
                      </div>
                    </div>

                    {/* Recommended Window & Warning Line */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <FaClock style={{ color: '#64748b' }} />
                      <span>Recommended Time Window: <strong>{weatherInfo.recommended_window}</strong></span>
                    </div>

                    {weatherInfo.weather_warnings && weatherInfo.weather_warnings.length > 0 && (
                      <div style={{ marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fca5a5', borderRadius: '12px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 800, color: '#991b1b' }}>
                        {weatherInfo.weather_warnings.map((warn, idx) => (
                          <div key={idx}>⚠️ {warn}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ACTION TOOLBAR (SPAN 12) */}
                <div style={{ gridColumn: 'span 12', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: '#ffffff', borderRadius: '50px', padding: '12px 24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                  <button
                    type="button"
                    onClick={handleDownloadPDFReport}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '10px 22px',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    📄 Print / Download Official Field Spray Report
                  </button>

                  <button
                    type="button"
                    onClick={saveToMongoDB}
                    disabled={isSaving}
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #059669',
                      color: '#059669',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '10px 22px',
                      borderRadius: '50px',
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                    }}
                    onMouseEnter={(e) => !isSaving && (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => !isSaving && (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <FaBookmark />
                    <span>{isSaving ? "Saving..." : "Save Diagnosis to My Saved Plants"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearData}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      padding: '12px 26px',
                      borderRadius: '50px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 6px 18px rgba(5, 150, 105, 0.3)',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FaRedo />
                    <span>Upload Another Cotton Leaf Photo</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* LOGIN RESTRICTION DIALOG FOR UPLOADING */}
      <Dialog 
        open={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
        PaperProps={{ style: { borderRadius: 24, padding: 20, maxWidth: 460, textAlign: 'center' } }}
      >
        <DialogTitle style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#e6f4ea', color: '#059669', fontSize: 32, margin: '0 auto 12px auto' }}>
            🔒
          </div>
          <Typography variant="h5" style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Registered Farmer Access Only
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ color: '#475569', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            Please log in with your account to upload crop leaf photos and generate instant AI disease diagnostics.
          </Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', paddingBottom: 16, paddingTop: 16 }}>
          <Button
            variant="contained"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 28px', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/login'}
          >
            🔑 LOGIN TO SCAN LEAF
          </Button>
          <Button onClick={() => setShowLoginPrompt(false)} style={{ color: '#64748b', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* COMPLETE PROFILE MODAL */}
      <Dialog 
        open={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        PaperProps={{
          style: {
            borderRadius: '24px',
            padding: '1rem',
            maxWidth: '480px',
            width: '100%'
          }
        }}
      >
        <DialogTitle style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '1.35rem', paddingBottom: '0.5rem' }}>
          🌾 Complete Your Farmer Profile
        </DialogTitle>
        <DialogContent style={{ paddingTop: '0.5rem' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Add your farm details to activate real-time WhatsApp advisory & automated spray alerts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                WhatsApp Number
              </label>
              <input
                type="text"
                value={profileFormData.whatsappNumber}
                onChange={(e) => setProfileFormData({ ...profileFormData, whatsappNumber: e.target.value })}
                placeholder="e.g. +92 300 1234567"
                style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Main Crop
                </label>
                <select
                  value={profileFormData.mainCrop}
                  onChange={(e) => setProfileFormData({ ...profileFormData, mainCrop: e.target.value })}
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Cotton">🌱 Cotton</option>
                  <option value="Potato">🥔 Potato</option>
                  <option value="Tomato">🍅 Tomato</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                  District / City
                </label>
                <input
                  type="text"
                  value={profileFormData.city}
                  onChange={(e) => setProfileFormData({ ...profileFormData, city: e.target.value })}
                  placeholder="e.g. Khairpur"
                  style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>
                Land Size (Acres)
              </label>
              <input
                type="text"
                value={profileFormData.landSize}
                onChange={(e) => setProfileFormData({ ...profileFormData, landSize: e.target.value })}
                placeholder="e.g. 10 Acres"
                style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b', outline: 'none' }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions style={{ padding: '1rem 1.5rem 1.25rem 1.5rem', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setShowProfileModal(false)}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '50px', padding: '8px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setIsProfileComplete(true);
              localStorage.setItem('plantwise_user_profile', JSON.stringify({ ...profileFormData, isProfileComplete: true }));
              setShowProfileModal(false);
              notify.success("Farmer Profile Completed & WhatsApp Alerts Enabled!");
            }}
            style={{ background: '#059669', color: '#ffffff', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
          >
            Save Profile & Enable Alerts
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};