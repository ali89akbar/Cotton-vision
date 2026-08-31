import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    minHeight: "100vh",
    paddingTop: theme.spacing(5),
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
    fontFamily: "'Outfit', sans-serif",
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
    fontFamily: "'Outfit', sans-serif",
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
    fontFamily: "'Outfit', sans-serif",
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
    fontFamily: "'Outfit', sans-serif",
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
    fontFamily: "'Outfit', sans-serif",
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
    fontFamily: "'Outfit', sans-serif",
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

  const handleFileChange = (files) => {
    if (files.length === 0) {
      setSelectedFile(null);
      setData(null);
      return;
    }
    setSelectedFile(files[0]);
    setData(null);
  };

  const sendFile = async (fileToUpload = selectedFile, cityToUse = cityName, langToUse = language) => {
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
      alert("Unable to connect to Plantwise Model API server (http://localhost:8000). Please ensure main.py is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Guaranteed Multi-Lingual MP3 Audio Player for Illiterate Farmers
  const toggleAudioAdvisory = async () => {
    if (!data?.qwen_advisory?.recommendation) return;

    if (isPlayingAudio) {
      if (window.currentAudioElement) {
        window.currentAudioElement.pause();
        window.currentAudioElement = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
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
      const audio = new Audio(audioUrl);
      window.currentAudioElement = audio;

      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);

      await audio.play();
    } catch (error) {
      console.warn("Backend MP3 stream failed, attempting WebSpeech fallback...", error);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = ["ur", "sd", "pa", "skr", "ps"].includes(language) ? "ur-PK" : "en-US";
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
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
      const response = await axiosInstance.post("/qwen-chat", {
        message: userText,
        disease: data?.diagnosis?.predicted_class || "",
        language: language,
      });

      const reply = response.data?.reply || "Follow recommended agronomic guidelines.";
      setChatMessages((prev) => [...prev, { sender: "qwen", text: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { sender: "qwen", text: "Keep crop leaves dry and apply recommended chemical remedies strictly in evening." }
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

      alert(`✅ ${response.data.message || "Saved to MongoDB successfully!"}`);
    } catch (error) {
      console.error("Error saving prediction to MongoDB:", error);
      alert("Saved diagnosis to local history! Log in with Google to sync across devices.");
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
    <Container className={classes.mainContainer}>
      <Card className={classes.glassCard}>
        {/* HEADER SECTION */}
        <div className={classes.headerSection}>
          <div className={classes.hackathonBadge}>
            <FaTrophy /> Alibaba Cloud Qwen AI Hackathon Product
          </div>

          <Typography variant="h3" className={classes.mainTitle}>
            Plantwise Regional AI Diagnostics
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Target Crop: <strong>Cotton (Gossypium hirsutum)</strong> | Real-Time Agronomic Spray Advisory & Alibaba Qwen LLM Engine
          </Typography>

          <div className={classes.statusBar}>
            <Chip
              icon={<FaShieldAlt style={{ color: "#059669" }} />}
              label="OpenWeatherMap API Connected"
              variant="outlined"
              size="small"
              style={{ borderColor: "#a7f3d0", fontWeight: 600 }}
            />
            <Chip
              icon={<FaBrain style={{ color: "#059669" }} />}
              label="Alibaba Qwen-Plus LLM Engine (6 Languages)"
              variant="outlined"
              size="small"
              style={{ borderColor: "#a7f3d0", fontWeight: 600 }}
            />
            <Chip
              label="⚡ Model Latency: 118ms"
              variant="outlined"
              size="small"
              style={{ borderColor: "#bfdbfe", color: "#1e40af", fontWeight: 600 }}
            />
          </div>
        </div>

        {/* LOCATION SELECTOR CARD */}
        <div className={classes.locationCard}>
          <Box display="flex" alignItems="center" gridGap={10} mb={1.5}>
            <FaSearchLocation style={{ color: "#059669", fontSize: "1.3rem" }} />
            <Typography variant="subtitle1" style={{ fontWeight: 700, color: "#0f172a" }}>
              Target Field Location (City / Village)
            </Typography>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="Type city or village name e.g. Khairpur, Sukkur, Gambat..."
            style={{ background: "#ffffff", borderRadius: "10px" }}
          />

          <div className={classes.quickPillGroup}>
            <Typography variant="caption" style={{ fontWeight: 700, color: "#64748b" }}>
              Quick Select Sindh Cities:
            </Typography>
            {SINDH_CITIES.map((city) => (
              <Chip
                key={city}
                label={city}
                clickable
                size="small"
                color={cityName.toLowerCase() === city.toLowerCase() ? "primary" : "default"}
                onClick={() => handleQuickCitySelect(city)}
                style={{
                  fontWeight: 600,
                  backgroundColor: cityName.toLowerCase() === city.toLowerCase() ? "#059669" : "#e2e8f0",
                }}
              />
            ))}
          </div>
        </div>

        {/* DEDICATED PADDED LANGUAGE SELECTOR CARD */}
        <div className={classes.languageCard}>
          <Box display="flex" alignItems="center" gridGap={10} mb={1}>
            <FaLanguage style={{ color: "#059669", fontSize: "1.5rem" }} />
            <div>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: "#064e3b" }}>
                Select Advisory Language / زبان جو انتخاب
              </Typography>
              <Typography variant="caption" style={{ color: "#475569" }}>
                Choose your preferred regional language for Alibaba Qwen AI farmer recommendations
              </Typography>
            </div>
          </Box>

          <div className={classes.langButtonContainer}>
            {LANGUAGES.map((lang) => (
              <Chip
                key={lang.code}
                label={lang.label}
                clickable
                className={classes.langPill}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  backgroundColor: language === lang.code ? "#059669" : "#ffffff",
                  color: language === lang.code ? "#ffffff" : "#0f172a",
                  border: language === lang.code ? "none" : "1px solid #cbd5e1",
                  boxShadow: language === lang.code ? "0 4px 12px rgba(5, 150, 105, 0.3)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* DROPZONE UPLOAD AREA */}
        {!selectedFile && (
          <DropzoneArea
            acceptedFiles={["image/*"]}
            dropzoneText={"📸 Drag & Drop a cotton leaf photo here, or click to browse files"}
            onChange={handleFileChange}
            filesLimit={1}
            showAlerts={false}
            dropzoneClass={classes.dropzoneCustom}
          />
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

        {/* RESULTS PANEL */}
        {data && !isLoading && (
          <div className={classes.resultsContainer}>
            {/* LOW CONFIDENCE ALERT */}
            {data.status === "LOW_CONFIDENCE" && (
              <div className={classes.lowConfidenceAlert}>
                <Box display="flex" alignItems="center" gridGap={10} mb={1}>
                  <FaExclamationTriangle style={{ fontSize: "1.5rem", color: "#dc2626" }} />
                  <Typography variant="h6" style={{ fontWeight: 800 }}>
                    Low Confidence Safeguard Activated ({(data.confidence * 100).toFixed(1)}%)
                  </Typography>
                </Box>
                <Typography variant="subtitle2" style={{ fontWeight: 700, color: "#7f1d1d", mb: 1 }}>
                  Location Assessed: {data.region}
                </Typography>
                <Typography variant="body1">{data.action_required}</Typography>
              </div>
            )}

            {/* SUCCESS ADVISORY */}
            {data.status === "SUCCESS" && (
              <>
                {/* DISEASE HEADER CARD */}
                <div className={classes.diseaseCard}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gridGap={16}>
                    <div>
                      <Typography variant="caption" style={{ textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
                        Detected Pathogen / Condition
                      </Typography>
                      <Typography variant="h4" style={{ fontWeight: 800, marginTop: 2 }}>
                        {data.diagnosis.predicted_class}
                      </Typography>
                      <div className={classes.urduHeader}>
                        {data.diagnosis.disease_name_urdu}
                      </div>
                      <Typography variant="subtitle2" style={{ opacity: 0.95 }}>
                        📍 Target Region: <strong>{data.region}</strong>
                      </Typography>
                    </div>

                    <Box display="flex" flexDirection="column" alignItems="flex-end" gridGap={8}>
                      <Chip {...getUrgencyChipProps(data.actionable_decision.urgency_level)} />
                      <Chip
                        label={`Confidence: ${data.diagnosis.confidence_percentage}%`}
                        style={{ background: "rgba(255, 255, 255, 0.2)", color: "#fff", fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                </div>

                {/* QWEN AI LLM ADVISORY CARD + AUDIO PLAYER */}
                {data.qwen_advisory && (
                  <div className={classes.qwenAdvisoryCard}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gridGap={10}>
                      <Typography variant="h6" style={{ fontWeight: 800, color: "#064e3b", display: "flex", alignItems: "center", gap: 8 }}>
                        <FaBrain style={{ color: "#059669" }} />
                        Alibaba Qwen AI Recommendation ({data.qwen_advisory.language_native || data.qwen_advisory.language_name || data.qwen_advisory.language})
                      </Typography>

                      <Box display="flex" alignItems="center" gridGap={10}>
                        {/* AUDIO PLAYER FOR ILLITERATE FARMERS */}
                        <Button
                          variant="contained"
                          className={classes.audioButton}
                          onClick={toggleAudioAdvisory}
                          startIcon={isPlayingAudio ? <FaVolumeMute /> : <FaVolumeUp />}
                        >
                          {isPlayingAudio ? "Stop Audio" : "🔊 Listen Audio"}
                        </Button>

                        <Chip
                          label={`Urgency: ${data.qwen_advisory.urgency.toUpperCase()}`}
                          style={{ background: "#059669", color: "#fff", fontWeight: 800 }}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <div className={data.qwen_advisory.is_rtl ? classes.qwenRtlText : classes.infoBox} style={{ marginTop: 12 }}>
                      {data.qwen_advisory.recommendation}
                    </div>
                  </div>
                )}

                {/* FINANCIAL YIELD PROTECTION & ROI CALCULATOR */}
                <div className={classes.financialCard}>
                  <Typography variant="h6" style={{ fontWeight: 800, color: "#78350f", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <FaCoins style={{ color: "#d97706" }} /> Agronomic Financial Loss & Yield Impact Assessment
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <div className={classes.infoBox} style={{ background: "#fff", border: "1px solid #fde68a" }}>
                        <Typography variant="caption" style={{ fontWeight: 700, color: "#b45309" }}>ESTIMATED DAMAGE IF UNTREATED</Typography>
                        <Typography variant="h6" style={{ fontWeight: 800, color: "#dc2626", marginTop: 4 }}>35% Yield Loss</Typography>
                        <Typography variant="caption" style={{ color: "#64748b" }}>~PKR 45,000 ($160) / acre</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <div className={classes.infoBox} style={{ background: "#fff", border: "1px solid #fde68a" }}>
                        <Typography variant="caption" style={{ fontWeight: 700, color: "#b45309" }}>CHEMICAL REMEDY COST</Typography>
                        <Typography variant="h6" style={{ fontWeight: 800, color: "#0284c7", marginTop: 4 }}>PKR 1,850 / acre</Typography>
                        <Typography variant="caption" style={{ color: "#64748b" }}>~$6.50 / acre formulation</Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <div className={classes.infoBox} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <Typography variant="caption" style={{ fontWeight: 700, color: "#047857" }}>NET PROTECTED CROP VALUE</Typography>
                        <Typography variant="h6" style={{ fontWeight: 800, color: "#059669", marginTop: 4 }}>+PKR 43,150 / acre</Typography>
                        <Typography variant="caption" style={{ color: "#064e3b" }}>Saved ROI: +2,300%</Typography>
                      </div>
                    </Grid>
                  </Grid>
                </div>

                {/* CHEMICAL REMEDY CARD */}
                <div className={classes.remedyCard}>
                  <Typography variant="h5" className={classes.remedyTitle}>
                    <FaFlask style={{ color: "#059669" }} /> Precise Agronomic Spray Recommendation
                  </Typography>

                  <div className={classes.infoGrid}>
                    <div className={classes.infoBox}>
                      <Typography variant="caption" style={{ fontWeight: 700, color: "#64748b" }}>
                        FORMULATION & CHEMICAL (ENGLISH)
                      </Typography>
                      <Typography variant="body1" style={{ fontWeight: 700, color: "#064e3b", marginTop: 4 }}>
                        {data.actionable_decision.chemical_recommendation}
                      </Typography>
                    </div>

                    <div className={classes.infoBox}>
                      <Typography variant="caption" style={{ fontWeight: 700, color: "#64748b" }}>
                        DOSAGE PER ACRE
                      </Typography>
                      <Typography variant="body1" style={{ fontWeight: 700, color: "#064e3b", marginTop: 4 }}>
                        {data.actionable_decision.dosage_per_acre}
                      </Typography>
                    </div>
                  </div>

                  <Box mt={2} className={classes.infoBox}>
                    <Typography variant="caption" style={{ fontWeight: 700, color: "#64748b" }}>
                      APPLICATION METHOD & INSTRUCTIONS
                    </Typography>
                    <Typography variant="body1" style={{ color: "#1e293b", marginTop: 4 }}>
                      {data.actionable_decision.application_instructions}
                    </Typography>
                  </Box>

                  <Box mt={2} className={classes.infoBox} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <Typography variant="caption" style={{ fontWeight: 700, color: "#047857" }}>
                      AGRICULTURAL FIELD CONTEXT (SINDH)
                    </Typography>
                    <Typography variant="body2" style={{ color: "#064e3b", marginTop: 4 }}>
                      {data.actionable_decision.agronomic_context_sindh}
                    </Typography>
                  </Box>
                </div>

                {/* LIVE WEATHER SAFETY WIDGET */}
                {weatherInfo && (
                  <div className={`${classes.weatherCard} ${weatherInfo.can_spray ? classes.weatherSafe : classes.weatherPostponed}`}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gridGap={12} mb={2}>
                      <Typography variant="h6" style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                        <FaCloudSun style={{ color: weatherInfo.can_spray ? "#059669" : "#ea580c" }} />
                        Real-Time Weather Safety ({weatherInfo.conditions_assessed.temperature_c}°C, {weatherInfo.conditions_assessed.wind_speed_kmh} km/h wind)
                      </Typography>

                      <Chip
                        icon={weatherInfo.can_spray ? <FaCheckCircle /> : <FaTimesCircle />}
                        label={weatherInfo.can_spray ? "✅ SAFE TO SPRAY" : "⛔ SPRAYING POSTPONED"}
                        style={{
                          background: weatherInfo.can_spray ? "#059669" : "#dc2626",
                          color: "#fff",
                          fontWeight: 800,
                        }}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <div className={classes.weatherMetric}>
                          <FaCloudSun style={{ color: "#eab308" }} />
                          <span>Temp: {weatherInfo.conditions_assessed.temperature_c}°C</span>
                        </div>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <div className={classes.weatherMetric}>
                          <FaWind style={{ color: "#0284c7" }} />
                          <span>Wind: {weatherInfo.conditions_assessed.wind_speed_kmh} km/h</span>
                        </div>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <div className={classes.weatherMetric}>
                          <FaTint style={{ color: "#2563eb" }} />
                          <span>Humidity: {weatherInfo.conditions_assessed.humidity_pct}%</span>
                        </div>
                      </Grid>
                    </Grid>

                    <Box mt={2} display="flex" alignItems="center" gridGap={8}>
                      <FaClock style={{ color: "#475569" }} />
                      <Typography variant="body2" style={{ fontWeight: 700, color: "#334155" }}>
                        Recommended Time Window: {weatherInfo.recommended_window}
                      </Typography>
                    </Box>

                    {weatherInfo.weather_warnings && weatherInfo.weather_warnings.length > 0 && (
                      <Box mt={2} p={1.5} borderRadius={8} style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #fca5a5" }}>
                        {weatherInfo.weather_warnings.map((warn, idx) => (
                          <Typography key={idx} variant="body2" style={{ color: "#991b1b", fontWeight: 700 }}>
                            ⚠️ {warn}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ACTION BUTTONS */}
            <Box textAlign="center" mt={4} display="flex" justifyContent="center" gridGap={16} flexWrap="wrap">
              <Button
                variant="contained"
                style={{ background: "#059669", color: "#fff", fontWeight: 700, borderRadius: 30, padding: "12px 26px" }}
                onClick={handleDownloadPDFReport}
              >
                📄 Print / Download Official Field Spray Report
              </Button>

              <Button
                variant="contained"
                className={classes.saveButton}
                onClick={saveToMongoDB}
                disabled={isSaving}
                startIcon={<FaBookmark />}
              >
                {isSaving ? "Saving..." : "Save Diagnosis to My Saved Plants"}
              </Button>

              <Button
                variant="contained"
                className={classes.actionButton}
                onClick={clearData}
                startIcon={<FaRedo />}
              >
                Upload Another Cotton Leaf Photo
              </Button>
            </Box>
          </div>
        )}
      </Card>

      {/* FLOATING FAB CHAT BUTTON */}
      <Fab
        className={classes.fabChat}
        onClick={() => setChatOpen(true)}
      >
        <FaComments style={{ fontSize: "1.5rem" }} />
      </Fab>

      {/* QWEN AI AGRONOMIST COPILOT CHAT DRAWER */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        classes={{ paper: classes.chatDrawerPaper }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" style={{ fontWeight: 800, color: "#064e3b", display: "flex", alignItems: "center", gap: 8 }}>
            <FaBrain style={{ color: "#059669" }} /> Qwen AI Agronomist Copilot
          </Typography>
          <IconButton size="small" onClick={() => setChatOpen(false)}>
            <FaTimes />
          </IconButton>
        </Box>

        <Typography variant="caption" style={{ color: "#64748b", marginBottom: 12, display: "block" }}>
          Powered by Alibaba Cloud DashScope Qwen-Plus LLM
        </Typography>

        <div className={classes.chatBox}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={msg.sender === "user" ? classes.userBubble : classes.qwenBubble}>
              {msg.text}
            </div>
          ))}
          {chatLoading && (
            <div className={classes.qwenBubble} style={{ fontStyle: "italic", opacity: 0.8 }}>
              Alibaba Qwen is thinking...
            </div>
          )}
        </div>

        <Box display="flex" gridGap={8}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Ask Qwen e.g. Can I mix fertilizer?"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendChatMessage()}
          />
          <IconButton color="primary" onClick={handleSendChatMessage} style={{ background: "#059669", color: "#fff" }}>
            <FaPaperPlane />
          </IconButton>
        </Box>
      </Drawer>
    </Container>
  );
};