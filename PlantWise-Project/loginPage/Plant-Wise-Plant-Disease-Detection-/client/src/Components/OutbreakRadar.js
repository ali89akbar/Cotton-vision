import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSatellite,
  FaFlask,
  FaMapMarkerAlt,
  FaBug,
  FaCloudSun,
  FaTint,
  FaWind,
  FaCloudRain,
  FaSun,
  FaThermometerHalf,
  FaUmbrella,
  FaShieldAlt,
} from "react-icons/fa";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

const SINDH_OUTBREAK_DATA = [
  {
    city: "Gambat",
    district: "Khairpur District, Sindh",
    cityUrdu: "گنبٽ",
    lat: 27.3524,
    lng: 68.5204,
    riskLevel: "CRITICAL_RISK",
    primaryThreat: "Fall Armyworm (Nocturnal Caterpillars)",
    threatUrdu: "فال آرمی ورم (رات کا کیڑا)",
    threatScore: 88,
    threatLevelText: "CRITICAL",
    gaugeColor: "#dc2626",
    gaugeBgTrack: "#fee2e2",
    heroBg: "#fef2f2",
    heroBorder: "#fecaca",
    temp: "33.5°C",
    wind: "9.8 km/h",
    windDeg: 45,
    humidity: 71,
    feelsLike: 37,
    uvIndex: 7,
    precipitation: "0.2 cm",
    chanceOfRain: 45,
    aqi: 130,
    affectedAcres: "580 Acres",
    recommendedChemical: "Emamectin Benzoate 5% SG @ 75g/acre (Evening Spray)",
    statusBadge: { label: "CRITICAL OUTBREAK", bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
  },
  {
    city: "Sukkur",
    district: "Sukkur District, Sindh",
    cityUrdu: "سکر",
    lat: 27.7052,
    lng: 68.8574,
    riskLevel: "HIGH_RISK",
    primaryThreat: "Bacterial Blight & High Humidity",
    threatUrdu: "بیکٹیریل بلائٹ اور نمی",
    threatScore: 76,
    threatLevelText: "HIGH RISK",
    gaugeColor: "#ea580c",
    gaugeBgTrack: "#ffedd5",
    heroBg: "#fff7ed",
    heroBorder: "#fed7aa",
    temp: "34.2°C",
    wind: "14.5 km/h",
    windDeg: 120,
    humidity: 78,
    feelsLike: 39,
    uvIndex: 8,
    precipitation: "0.8 cm",
    chanceOfRain: 60,
    aqi: 142,
    affectedAcres: "420 Acres",
    recommendedChemical: "Copper Oxychloride @ 250g/acre + Streptocycline",
    statusBadge: { label: "HIGH THREAT", bg: "#ffedd5", text: "#9a3412", dot: "#ea580c" },
  },
  {
    city: "Khairpur",
    district: "Khairpur Mirs, Sindh",
    cityUrdu: "خیرپور",
    lat: 27.5295,
    lng: 68.7592,
    riskLevel: "MODERATE_RISK",
    primaryThreat: "Aphids (Sucking Pest Aggregation)",
    threatUrdu: "سست تیلا (چوسنے والے کیڑے)",
    threatScore: 58,
    threatLevelText: "MODERATE",
    gaugeColor: "#d97706",
    gaugeBgTrack: "#fef3c7",
    heroBg: "#fffbeb",
    heroBorder: "#fde68a",
    temp: "35.8°C",
    wind: "11.2 km/h",
    windDeg: 90,
    humidity: 62,
    feelsLike: 38,
    uvIndex: 6,
    precipitation: "0.0 cm",
    chanceOfRain: 25,
    aqi: 118,
    affectedAcres: "310 Acres",
    recommendedChemical: "Imidacloprid 200 SL @ 60 ml/acre",
    statusBadge: { label: "MODERATE THREAT", bg: "#fef3c7", text: "#92400e", dot: "#d97706" },
  },
  {
    city: "Rohri",
    district: "Sukkur District, Sindh",
    cityUrdu: "روهڙي",
    lat: 27.6744,
    lng: 68.8957,
    riskLevel: "MODERATE_RISK",
    primaryThreat: "Target Spot Fungal Lesions",
    threatUrdu: "ٹارگٹ اسپاٹ فنگس",
    threatScore: 54,
    threatLevelText: "MODERATE",
    gaugeColor: "#d97706",
    gaugeBgTrack: "#fef3c7",
    heroBg: "#fffbeb",
    heroBorder: "#fde68a",
    temp: "34.8°C",
    wind: "13.1 km/h",
    windDeg: 135,
    humidity: 68,
    feelsLike: 37,
    uvIndex: 6,
    precipitation: "0.1 cm",
    chanceOfRain: 30,
    aqi: 125,
    affectedAcres: "210 Acres",
    recommendedChemical: "Azoxystrobin + Difenoconazole @ 200 ml/acre",
    statusBadge: { label: "MODERATE THREAT", bg: "#fef3c7", text: "#92400e", dot: "#d97706" },
  },
  {
    city: "Ghotki",
    district: "Ghotki District, Sindh",
    cityUrdu: "گھوٽڪي",
    lat: 28.0060,
    lng: 69.3161,
    riskLevel: "LOW_RISK",
    primaryThreat: "Powdery Mildew (Early Symptoms)",
    threatUrdu: "پاؤڈری ملڈیو (ابتدائی علامات)",
    threatScore: 24,
    threatLevelText: "LOW / SAFE",
    gaugeColor: "#16a34a",
    gaugeBgTrack: "#dcfce7",
    heroBg: "#f0fdf4",
    heroBorder: "#bbf7d0",
    temp: "36.4°C",
    wind: "12.0 km/h",
    windDeg: 180,
    humidity: 52,
    feelsLike: 36,
    uvIndex: 5,
    precipitation: "0.0 cm",
    chanceOfRain: 10,
    aqi: 88,
    affectedAcres: "140 Acres",
    recommendedChemical: "Water-Soluble Sulfur @ 1 kg/acre",
    statusBadge: { label: "LOW THREAT / SAFE", bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  },
];

const OutbreakRadar = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("ALL");
  const [selectedCityName, setSelectedCityName] = useState("Gambat");
  const [displayScore, setDisplayScore] = useState(88);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSource, setWeatherSource] = useState("OpenWeatherMap Live API");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:6005/login/sucess", { withCredentials: true })
      .then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
        setAuthLoading(false);
      })
      .catch(() => {
        setAuthLoading(false);
      });
  }, []);

  const filteredCities = SINDH_OUTBREAK_DATA.filter((item) => {
    const matchesSearch =
      item.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.primaryThreat.toLowerCase().includes(searchFilter.toLowerCase());

    if (selectedRiskFilter === "ALL") return matchesSearch;
    if (selectedRiskFilter === "HIGH") return matchesSearch && (item.riskLevel === "HIGH_RISK" || item.riskLevel === "CRITICAL_RISK");
    if (selectedRiskFilter === "MODERATE") return matchesSearch && item.riskLevel === "MODERATE_RISK";
    if (selectedRiskFilter === "LOW") return matchesSearch && item.riskLevel === "LOW_RISK";
    return matchesSearch;
  });

  const activeCity =
    filteredCities.find((c) => c.city.toLowerCase() === selectedCityName.toLowerCase()) ||
    filteredCities[0] ||
    SINDH_OUTBREAK_DATA[0];

  // Fetch and Map Live Real-Time Weather from OpenWeatherMap API (with Satellite fallback)
  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);

    const fetchWeather = async () => {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || "2c68cac827dd9e327fdd97b4e39326ed";

      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${activeCity.lat}&lon=${activeCity.lng}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${activeCity.lat}&lon=${activeCity.lng}&appid=${apiKey}&units=metric`;

        // Third-party weather APIs respond with `Access-Control-Allow-Origin: *`,
        // which the browser rejects when requests are sent with credentials
        // (a global `axios.defaults.withCredentials = true` is set in SocialMedia.js).
        // Force `withCredentials: false` per-request so the CORS check passes.
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get(weatherUrl, { withCredentials: false }),
          axios.get(forecastUrl, { withCredentials: false }).catch(() => ({ data: null })),
        ]);

        if (isMounted && weatherRes.data && weatherRes.data.main) {
          const owm = weatherRes.data;
          const forecast = forecastRes.data;

          const liveTemp = `${owm.main.temp.toFixed(1)}°C`;
          const liveHumidity = Math.round(owm.main.humidity);
          const liveWindSpeed = Math.round((owm.wind?.speed || 0) * 3.6);
          const liveWindDeg = Math.round(owm.wind?.deg || activeCity.windDeg);
          const liveFeelsLike = Math.round(owm.main.feels_like);
          
          const rainMm = owm.rain?.["1h"] || owm.rain?.["3h"] || 0;
          const livePrecip = `${(rainMm / 10).toFixed(1)} cm`;

          const pop = forecast?.list?.[0]?.pop !== undefined ? Math.round(forecast.list[0].pop * 100) : activeCity.chanceOfRain;

          const cloudCover = owm.clouds?.all || 0;
          const estimatedUv = Math.max(1, Math.min(11, Math.round(10 - (cloudCover / 10))));

          setLiveWeather({
            temp: liveTemp,
            humidity: liveHumidity,
            windSpeed: liveWindSpeed,
            windDeg: liveWindDeg,
            precipitation: livePrecip,
            precipitationRaw: rainMm,
            uvIndex: estimatedUv,
            feelsLike: liveFeelsLike,
            chanceOfRain: pop,
            aqi: activeCity.aqi,
          });
          setWeatherSource("OpenWeatherMap Live API");
          setWeatherLoading(false);
          return;
        }
      } catch (owmError) {
        // Fallback to Open-Meteo Satellite Feed
        try {
          const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${activeCity.lat}&longitude=${activeCity.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,wind_speed_10m,wind_direction_10m,uv_index&hourly=precipitation_probability&timezone=auto`;
          const meteoRes = await axios.get(meteoUrl, { withCredentials: false });
          
          if (isMounted && meteoRes.data && meteoRes.data.current) {
            const curr = meteoRes.data.current;
            setLiveWeather({
              temp: `${curr.temperature_2m.toFixed(1)}°C`,
              humidity: Math.round(curr.relative_humidity_2m),
              windSpeed: Math.round(curr.wind_speed_10m),
              windDeg: Math.round(curr.wind_direction_10m || activeCity.windDeg),
              precipitation: curr.precipitation !== undefined ? `${(curr.precipitation / 10).toFixed(1)} cm` : activeCity.precipitation,
              precipitationRaw: curr.precipitation || 0,
              uvIndex: Math.round(curr.uv_index || activeCity.uvIndex),
              feelsLike: Math.round(curr.apparent_temperature || activeCity.feelsLike),
              chanceOfRain: meteoRes.data.hourly?.precipitation_probability?.[0] || activeCity.chanceOfRain,
              aqi: activeCity.aqi,
            });
            setWeatherSource("Open-Meteo Satellite Feed");
            setWeatherLoading(false);
            return;
          }
        } catch (meteoError) {
          if (isMounted) {
            setLiveWeather({
              temp: activeCity.temp,
              humidity: activeCity.humidity,
              windSpeed: parseFloat(activeCity.wind),
              windDeg: activeCity.windDeg,
              precipitation: activeCity.precipitation,
              precipitationRaw: parseFloat(activeCity.precipitation) * 10,
              uvIndex: activeCity.uvIndex,
              feelsLike: activeCity.feelsLike,
              chanceOfRain: activeCity.chanceOfRain,
              aqi: activeCity.aqi,
            });
            setWeatherSource("Regional Sindh Ag-Telemetry");
            setWeatherLoading(false);
          }
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [activeCity.city, activeCity.lat, activeCity.lng]);

  const handleFilterClick = (filter) => {
    setSelectedRiskFilter(filter);
    const matches = SINDH_OUTBREAK_DATA.filter((item) => {
      const matchesSearch =
        item.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.primaryThreat.toLowerCase().includes(searchFilter.toLowerCase());
      if (filter === "ALL") return matchesSearch;
      if (filter === "HIGH") return matchesSearch && (item.riskLevel === "HIGH_RISK" || item.riskLevel === "CRITICAL_RISK");
      if (filter === "MODERATE") return matchesSearch && item.riskLevel === "MODERATE_RISK";
      if (filter === "LOW") return matchesSearch && item.riskLevel === "LOW_RISK";
      return matchesSearch;
    });

    if (matches.length > 0) {
      setSelectedCityName(matches[0].city);
    }
  };

  useEffect(() => {
    setDisplayScore(0);
    let start = 0;
    const target = activeCity.threatScore;
    const duration = 500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [activeCity.city, activeCity.threatScore]);

  if (authLoading) {
    return (
      <div style={{ paddingTop: "8.5rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ border: "4px solid #e2e8f0", borderTop: "4px solid #059669", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: "8.5rem", paddingBottom: "4rem", minHeight: "100vh", background: "#f4f9f4", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "24px", textAlign: "center", maxWidth: "480px", margin: "0 1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f4ea", color: "#059669", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            🌱
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#0f172a", fontSize: "1.5rem" }}>
            🔒 Registered Farmer Access Only
          </h2>
          <p style={{ color: "#475569", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", margin: "12px 0 24px 0", fontSize: "0.95rem" }}>
            Please log in with your account to access the Outbreak Radar, view regional infestation heatmaps, and monitor crop health alerts.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            style={{ background: "#059669", color: "#fff", fontWeight: 800, borderRadius: 30, padding: "12px 30px", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 20px rgba(5,150,105,0.25)" }}
          >
            🔑 LOGIN TO ACCESS OUTBREAK RADAR
          </button>
        </div>
      </div>
    );
  }

  const arcLength = 220;
  const strokeOffset = arcLength - (arcLength * displayScore) / 100;

  // Real-time telemetry values
  const currentHumidity = liveWeather ? liveWeather.humidity : activeCity.humidity;
  const currentWindSpeed = liveWeather ? liveWeather.windSpeed : parseFloat(activeCity.wind);
  const currentPrecip = liveWeather ? liveWeather.precipitation : activeCity.precipitation;
  const currentUV = liveWeather ? liveWeather.uvIndex : activeCity.uvIndex;
  const currentFeelsLike = liveWeather ? liveWeather.feelsLike : activeCity.feelsLike;
  const currentRainChance = liveWeather ? liveWeather.chanceOfRain : activeCity.chanceOfRain;
  const currentTemp = liveWeather ? liveWeather.temp : activeCity.temp;
  const currentAqi = liveWeather ? liveWeather.aqi : activeCity.aqi;

  // AQI Helper logic
  const getAqiInfo = (val) => {
    if (val <= 50) return { label: "Good", color: "#16a34a", dotColor: "#16a34a" };
    if (val <= 100) return { label: "Moderate", color: "#ca8a04", dotColor: "#ca8a04" };
    if (val <= 150) return { label: "Poor", color: "#ea580c", dotColor: "#ea580c" };
    if (val <= 200) return { label: "Unhealthy", color: "#dc2626", dotColor: "#dc2626" };
    return { label: "Hazardous", color: "#7f1d1d", dotColor: "#7f1d1d" };
  };
  const aqiInfo = getAqiInfo(currentAqi);

  // AQI SVG indicator dot positioning on arc
  const aqiRatio = Math.min(Math.max(currentAqi / 200, 0), 1);
  const aqiAngleRad = (135 + 270 * aqiRatio) * (Math.PI / 180);
  const aqiDotX = (32.5 + 24 * Math.cos(aqiAngleRad)).toFixed(1);
  const aqiDotY = (32.5 + 24 * Math.sin(aqiAngleRad)).toFixed(1);

  // Speedometer needle rotation angle (0 km/h = -90deg, 40 km/h = +90deg)
  const speedRatio = Math.min(Math.max(currentWindSpeed / 40, 0), 1);
  const needleAngle = -90 + speedRatio * 180;

  return (
    <div style={{ minHeight: "100vh", paddingTop: "8.5rem", paddingBottom: "5rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", background: "#f4f9f4" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* 1. HEADER SECTION */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#166534", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", borderRadius: "50px", padding: "7px 20px", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(5,150,105,0.06)" }}>
            <FaSatellite style={{ color: "#059669" }} /> {weatherSource.toUpperCase()} & SATELLITE RADAR FEED
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "2.75rem", color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.5px" }}>
            Sindh Agriculture <span style={{ color: "#059669" }}>Outbreak Radar</span>
          </h1>

          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#475569", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6, fontWeight: 500 }}>
            Live microclimate telemetry, dynamic threat score, and tailored agronomic spray advisory across Gambat, Sukkur, Khairpur, Rohri, and Ghotki.
          </p>
        </div>

        {/* TOP METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              🌾
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>1,660</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Monitored Acres</div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              🚨
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#dc2626" }}>3 Zones</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Active Outbreaks</div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              🛡️
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#059669" }}>84%</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Crop Safety Rate</div>
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              📡
            </div>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0284c7" }}>5 Cities</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Live Satellite Feed</div>
            </div>
          </div>
        </div>

        {/* SEARCH & RISK FILTERS */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1rem 1.5rem", marginBottom: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <FiSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#059669", fontSize: "1.15rem" }} />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by city or pathogen e.g. Gambat, Sukkur, Armyworm..."
              style={{ width: "100%", height: "44px", borderRadius: "12px", border: "1.5px solid #e2e8f0", paddingLeft: "42px", paddingRight: "14px", fontSize: "0.92rem", color: "#0f172a", outline: "none", background: "#f8fafc" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["ALL", "HIGH", "MODERATE", "LOW"].map((filter) => {
              const active = selectedRiskFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    background: active ? "#059669" : "#f1f5f9",
                    color: active ? "#ffffff" : "#475569",
                    border: "none",
                    borderRadius: "50px",
                    padding: "8px 20px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {filter === "ALL" ? "All Zones" : `${filter} Risk`}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. COMPACT MISSION CONTROL CARD (EXACT MATCHING ROW HEIGHTS ON LEFT & RIGHT) */}
        <motion.div
          key={activeCity.city}
          style={{
            background: activeCity.heroBg,
            border: `1.5px solid ${activeCity.heroBorder}`,
            borderRadius: "28px",
            padding: "1.75rem",
            boxShadow: `0 10px 30px rgba(0, 0, 0, 0.05)`,
            position: "relative",
            overflow: "hidden",
            marginBottom: "2rem",
            transition: "all 0.4s ease"
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* HEADER ROW */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: activeCity.gaugeColor, boxShadow: `0 0 10px ${activeCity.gaugeColor}` }}></div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: activeCity.gaugeColor }}>
                  SELECTED ZONE TELEMETRY & ADVISORY
                </span>
              </div>

              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "#0f172a", margin: "2px 0 0 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaMapMarkerAlt style={{ color: activeCity.gaugeColor }} /> {activeCity.city}
                <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: "1.4rem", color: "#059669" }}>({activeCity.cityUrdu})</span>
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#475569", margin: "1px 0 0 0", fontWeight: 600 }}>{activeCity.district}</p>
            </div>

            <div style={{ background: activeCity.statusBadge.bg, border: `1px solid ${activeCity.heroBorder}`, color: activeCity.statusBadge.text, fontWeight: 800, fontSize: "0.85rem", padding: "6px 18px", borderRadius: "50px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              🚨 {activeCity.statusBadge.label}
            </div>
          </div>

          {/* MAIN 2-COLUMN SPLIT: LEFT (MATCHING LENGTH [TEMP + AQI] + SPRAY) | RIGHT (3x2 WEATHER WIDGETS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
            
            {/* LEFT COLUMN: [TEMP + AQI] ROW + RECOMMENDED SPRAY */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem", height: "100%" }}>
              
              {/* TOP ROW: COMPACT TEMPERATURE + AQI BOX (EXACT SAME LENGTH/HEIGHT AS HUMIDITY, WIND, PRECIP) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                
                {/* 1. COMPACT AMBIENT TEMPERATURE (SAME LENGTH & PADDING) */}
                <div style={{ background: "#ffffff", border: `1.5px solid ${activeCity.heroBorder}`, borderRadius: "20px", padding: "1.25rem", minHeight: "165px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Temperature</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>
                      <FaThermometerHalf />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "0.35rem 0" }}>
                    <FaCloudSun style={{ fontSize: "2.6rem", color: "#d97706", flexShrink: 0 }} />
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "2.1rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {currentTemp}
                    </div>
                  </div>

                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <span>Live Ambient Temp</span>
                    {weatherLoading && <FiRefreshCw style={{ animation: "spin 1s linear infinite", color: "#059669" }} />}
                  </div>
                </div>

                {/* 2. AQI (AIR QUALITY INDEX) BOX (SAME LENGTH & PADDING AS HUMIDITY, WIND, PRECIP) */}
                <div style={{ background: "#ffffff", border: `1.5px solid ${activeCity.heroBorder}`, borderRadius: "20px", padding: "1.25rem", minHeight: "165px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Air Quality</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>
                      <FaShieldAlt />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>AQI</div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                        {currentAqi}
                      </div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 800, color: aqiInfo.color, marginTop: "2px" }}>
                        {aqiInfo.label}
                      </div>
                    </div>

                    {/* Circular Arc Meter with active dot */}
                    <div style={{ position: "relative", width: "62px", height: "62px", flexShrink: 0 }}>
                      <svg width="62" height="62" viewBox="0 0 65 65" style={{ display: "block" }}>
                        <defs>
                          <linearGradient id="aqiGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="45%" stopColor="#eab308" />
                            <stop offset="80%" stopColor="#ea580c" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                        <path d="M 15.5 49.5 A 24 24 0 1 1 49.5 49.5" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                        <path
                          d="M 15.5 49.5 A 24 24 0 1 1 49.5 49.5"
                          fill="none"
                          stroke="url(#aqiGrad)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="113.1"
                          strokeDashoffset={113.1 - 113.1 * aqiRatio}
                          style={{ transition: "stroke-dashoffset 0.6s ease" }}
                        />
                        <circle
                          cx={aqiDotX}
                          cy={aqiDotY}
                          r="4.5"
                          fill={aqiInfo.dotColor}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          style={{ transition: "all 0.6s ease" }}
                        />
                      </svg>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700 }}>
                    <span>0 Good</span>
                    <span>100 Mod</span>
                    <span>200+ Poor</span>
                  </div>
                </div>

              </div>

              {/* RECOMMENDED SPRAY ADVISORY CARD (MATCHING ROW 2 LENGTH) */}
              <div style={{ background: "#ffffff", border: `1.5px solid ${activeCity.heroBorder}`, borderRadius: "20px", padding: "1.25rem 1.4rem", minHeight: "165px", height: "100%", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: activeCity.gaugeColor, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", flexShrink: 0 }}>
                  <FaFlask />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: activeCity.gaugeColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    RECOMMENDED SPRAY ADVISORY ({activeCity.city.toUpperCase()})
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#0f172a", marginTop: "3px" }}>
                    {activeCity.recommendedChemical}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "3px", fontWeight: 600 }}>
                    Targeted chemical intervention for active spore containment.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 3 BY 3 / 3 BY 2 COMPACT WEATHER TELEMETRY GRID (ALL WITH MATCHING 165px LENGTH) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", height: "100%" }}>
              
              {/* 1. HUMIDITY (3-Segment with good | normal | bad labels) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Humidity</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaTint />
                  </div>
                </div>
                
                <div style={{ textAlign: "center", margin: "0.4rem 0" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
                    {currentHumidity}% <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#64748b" }}>{currentHumidity > 70 ? "bad" : currentHumidity > 45 ? "normal" : "good"}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ flex: 1, height: "8px", borderRadius: "6px", background: "#0284c7" }}></div>
                    <div style={{ flex: 1, height: "8px", borderRadius: "6px", background: currentHumidity > 45 ? "#0284c7" : "#e2e8f0" }}></div>
                    <div style={{ flex: 1, height: "8px", borderRadius: "6px", background: currentHumidity > 70 ? "#0284c7" : "#e2e8f0" }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700 }}>
                    <span>good</span>
                    <span>normal</span>
                    <span>bad</span>
                  </div>
                </div>
              </div>

              {/* 2. WIND (Speedometer Dial with Needle & Numbers) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Wind</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaWind />
                  </div>
                </div>

                {/* Speedometer Arc Graphic with Needle */}
                <div style={{ position: "relative", width: "120px", height: "60px", margin: "0.15rem auto" }}>
                  <svg width="120" height="60" viewBox="0 0 120 60" style={{ display: "block" }}>
                    <path d="M 12 55 A 48 48 0 0 1 108 55" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                    <path
                      d="M 12 55 A 48 48 0 0 1 108 55"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="150"
                      strokeDashoffset={150 - 150 * speedRatio}
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                    <text x="5" y="58" fontSize="7" fill="#94a3b8" fontWeight="bold">0</text>
                    <text x="14" y="30" fontSize="7" fill="#94a3b8" fontWeight="bold">5</text>
                    <text x="36" y="14" fontSize="7" fill="#94a3b8" fontWeight="bold">10</text>
                    <text x="76" y="14" fontSize="7" fill="#94a3b8" fontWeight="bold">20</text>
                    <text x="98" y="30" fontSize="7" fill="#94a3b8" fontWeight="bold">30</text>
                    <text x="105" y="58" fontSize="7" fill="#94a3b8" fontWeight="bold">40</text>
                  </svg>

                  {/* Needle */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "3px",
                      left: "50%",
                      width: "3px",
                      height: "28px",
                      background: "#0284c7",
                      borderRadius: "2px",
                      transformOrigin: "bottom center",
                      transform: `translateX(-50%) rotate(${needleAngle}deg)`,
                      transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#0284c7", position: "absolute", bottom: "-2px", left: "-2px" }}></div>
                  </div>
                </div>

                <div style={{ textAlign: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>
                  {currentWindSpeed} km/h
                </div>
              </div>

              {/* 3. PRECIPITATION (10 Rounded Dots with 0..90 labels) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Precip</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaCloudRain />
                  </div>
                </div>

                <div style={{ textAlign: "center", margin: "0.4rem 0" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
                    {currentPrecip}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, marginBottom: "4px" }}>
                    {["0", "20", "40", "60", "80"].map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {[0, 20, 40, 60, 80].map((step, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "8px",
                          borderRadius: "6px",
                          background: (parseFloat(currentPrecip) * 10) >= step ? "#0284c7" : "#e2e8f0",
                          transition: "background 0.3s ease",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. UV INDEX (5 Segments with 0-2..11+ labels) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>UV Index</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaSun />
                  </div>
                </div>

                <div style={{ textAlign: "center", margin: "0.4rem 0" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
                    {currentUV} <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#64748b" }}>{currentUV <= 2 ? "low" : currentUV <= 5 ? "med" : currentUV <= 7 ? "high" : "v.high"}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, marginBottom: "4px" }}>
                    <span>0-2</span>
                    <span>3-5</span>
                    <span>6-7</span>
                    <span>8-10</span>
                    <span>11+</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[2, 5, 7, 10, 12].map((threshold, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          height: "8px",
                          borderRadius: "6px",
                          background: currentUV >= threshold - 1 ? "#0284c7" : "#e2e8f0",
                          transition: "background 0.3s ease",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. FEELS LIKE (0°..25°..50° Slider) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Feels Like</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaThermometerHalf />
                  </div>
                </div>

                <div style={{ textAlign: "center", margin: "0.4rem 0" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
                    {currentFeelsLike}°
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, marginBottom: "4px" }}>
                    <span>0°</span>
                    <span>25°</span>
                    <span>50°</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", borderRadius: "6px", background: "#e2e8f0", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "6px",
                        background: "#0284c7",
                        width: `${Math.min(Math.max((currentFeelsLike / 50) * 100, 0), 100)}%`,
                        transition: "width 0.6s ease",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 6. CHANCE OF RAIN (0%..100% Progress Bar) */}
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.25rem", border: `1.5px solid ${activeCity.heroBorder}`, minHeight: "165px", height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Rain Chance</span>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>
                    <FaUmbrella />
                  </div>
                </div>

                <div style={{ textAlign: "center", margin: "0.4rem 0" }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a" }}>
                    {currentRainChance}%
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, marginBottom: "4px" }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", borderRadius: "6px", background: "#e2e8f0", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "6px",
                        background: "#0284c7",
                        width: `${currentRainChance}%`,
                        transition: "width 0.6s ease",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

        {/* 3. DEDICATED INFESTATION THREAT GAUGE & INTELLIGENCE CARD (SEPARATE STANDALONE SECTION) */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ background: "#ffffff", border: `2px solid ${activeCity.heroBorder}`, borderRadius: "24px", padding: "1.5rem 2rem", boxShadow: "0 6px 20px rgba(0,0,0,0.04)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
            
            {/* Left Info: Threat Details & Active Zone */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <FaShieldAlt style={{ color: activeCity.gaugeColor, fontSize: "1.2rem" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: activeCity.gaugeColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Infestation Threat Intelligence ({activeCity.city})
                </span>
              </div>

              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", margin: "0 0 6px 0" }}>
                {activeCity.primaryThreat}
              </h3>
              <p style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: "1.25rem", color: "#059669", margin: "0 0 8px 0" }}>
                {activeCity.threatUrdu}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
                Monitored crop belt area: <strong style={{ color: "#0f172a" }}>{activeCity.affectedAcres}</strong> in {activeCity.district}.
              </p>
            </div>

            {/* Right Side: Clean Animated Semi-Circle Gauge Arc */}
            <div style={{ background: activeCity.heroBg, border: `1.5px solid ${activeCity.heroBorder}`, borderRadius: "20px", padding: "1.25rem 2rem", textAlign: "center", minWidth: "250px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: activeCity.gaugeColor, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                INFESTATION THREAT GAUGE
              </div>

              <div style={{ width: "160px", margin: "0 auto" }}>
                <svg width="160" height="85" viewBox="0 0 160 85" style={{ display: "block", overflow: "visible" }}>
                  <path
                    d="M 15 75 A 65 65 0 0 1 145 75"
                    fill="none"
                    stroke={activeCity.gaugeBgTrack}
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15 75 A 65 65 0 0 1 145 75"
                    fill="none"
                    stroke={activeCity.gaugeColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray="205"
                    strokeDashoffset={strokeOffset}
                    style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.4s ease" }}
                  />
                </svg>
              </div>

              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: activeCity.gaugeColor, marginTop: "4px" }}>
                {displayScore}% {activeCity.threatLevelText}
              </div>
            </div>

          </div>
        </div>

        {/* 4. ALL CITY SURVEILLANCE CARDS */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", margin: "0 0 1.25rem 0" }}>
            Regional Sindh Cotton Surveillance Zones
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {filteredCities.map((item, idx) => {
            const isSelected = item.city === activeCity.city;

            return (
              <motion.div
                key={idx}
                onClick={() => setSelectedCityName(item.city)}
                style={{
                  background: isSelected ? "#f0fdf4" : "#ffffff",
                  border: isSelected ? "2px solid #059669" : "1.5px solid #e2e8f0",
                  borderRadius: "24px",
                  padding: "1.5rem",
                  boxShadow: isSelected ? "0 10px 25px rgba(5, 150, 105, 0.15)" : "0 6px 20px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                whileHover={{ y: -4, boxShadow: "0 15px 35px rgba(5, 150, 105, 0.12)", borderColor: "#059669" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div>
                  {/* CARD HEADER */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.city}
                        <span style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif", fontSize: "1.1rem", color: "#059669" }}>({item.cityUrdu})</span>
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{item.district}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: item.statusBadge.bg, padding: "5px 12px", borderRadius: "50px", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.statusBadge.dot }}></div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: item.statusBadge.text }}>{item.statusBadge.label}</span>
                    </div>
                  </div>

                  {/* THREAT SCORE PILL */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderRadius: "14px", padding: "8px 12px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b" }}>Threat Score:</span>
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: item.gaugeColor }}>
                      {item.threatScore}% ({item.threatLevelText})
                    </span>
                  </div>

                  {/* PATHOGEN THREAT BLOCK */}
                  <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "12px 14px", border: "1px solid #f1f5f9", marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Primary Pathogen Threat</div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaBug style={{ color: item.statusBadge.dot }} /> {item.primaryThreat}
                    </div>
                  </div>

                  {/* QUICK STATS */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "8px 12px" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1e40af", textTransform: "uppercase" }}>Humidity</div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>{item.humidity}% RH</div>
                    </div>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "8px 12px" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Wind Speed</div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>{item.wind}</div>
                    </div>
                  </div>
                </div>

                {/* RECOMMENDED SPRAY AT BOTTOM */}
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "16px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#047857", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaFlask /> Recommended Spray
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#064e3b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.recommendedChemical}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default OutbreakRadar;
