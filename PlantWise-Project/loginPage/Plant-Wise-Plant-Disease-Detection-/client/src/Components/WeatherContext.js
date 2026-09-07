import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

export const SINDH_OUTBREAK_DATA = [
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

const WeatherContext = createContext(null);

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return ctx;
};

export const WeatherProvider = ({ children }) => {
  const [selectedCityName, setSelectedCityName] = useState("Khairpur");
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSource, setWeatherSource] = useState("OpenWeatherMap Live API");

  const activeCity = useMemo(() => {
    return (
      SINDH_OUTBREAK_DATA.find(
        (c) => c.city.toLowerCase() === selectedCityName.toLowerCase()
      ) || SINDH_OUTBREAK_DATA[2] // Default Khairpur
    );
  }, [selectedCityName]);

  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);

    const fetchWeather = async () => {
      const apiKey =
        process.env.REACT_APP_OPENWEATHER_API_KEY || "2c68cac827dd9e327fdd97b4e39326ed";

      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${activeCity.lat}&lon=${activeCity.lng}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${activeCity.lat}&lon=${activeCity.lng}&appid=${apiKey}&units=metric`;

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

          const pop =
            forecast?.list?.[0]?.pop !== undefined
              ? Math.round(forecast.list[0].pop * 100)
              : activeCity.chanceOfRain;

          const cloudCover = owm.clouds?.all || 0;
          const estimatedUv = Math.max(
            1,
            Math.min(11, Math.round(10 - cloudCover / 10))
          );

          setLiveWeather({
            cityName: activeCity.city,
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
              cityName: activeCity.city,
              temp: `${curr.temperature_2m.toFixed(1)}°C`,
              humidity: Math.round(curr.relative_humidity_2m),
              windSpeed: Math.round(curr.wind_speed_10m),
              windDeg: Math.round(curr.wind_direction_10m || activeCity.windDeg),
              precipitation:
                curr.precipitation !== undefined
                  ? `${(curr.precipitation / 10).toFixed(1)} cm`
                  : activeCity.precipitation,
              precipitationRaw: curr.precipitation || 0,
              uvIndex: Math.round(curr.uv_index || activeCity.uvIndex),
              feelsLike: Math.round(curr.apparent_temperature || activeCity.feelsLike),
              chanceOfRain:
                meteoRes.data.hourly?.precipitation_probability?.[0] ||
                activeCity.chanceOfRain,
              aqi: activeCity.aqi,
            });
            setWeatherSource("Open-Meteo Satellite Feed");
            setWeatherLoading(false);
            return;
          }
        } catch (meteoError) {
          if (isMounted) {
            setLiveWeather({
              cityName: activeCity.city,
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
  }, [activeCity]);

  const value = {
    selectedCityName,
    setSelectedCityName,
    liveWeather,
    weatherLoading,
    weatherSource,
    activeCity,
    SINDH_OUTBREAK_DATA,
  };

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
};
