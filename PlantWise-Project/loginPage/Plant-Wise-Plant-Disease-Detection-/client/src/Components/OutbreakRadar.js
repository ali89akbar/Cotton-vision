import React, { useState } from "react";
import {
  Container,
  Card,
  Typography,
  Chip,
  Box,
  Grid,
  TextField,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  FaSatellite,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheckCircle,
  FaThermometerHalf,
  FaWind,
  FaTint,
  FaSearch,
  FaFlask,
  FaMapMarkerAlt,
  FaBug,
  FaChartLine,
} from "react-icons/fa";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    minHeight: "100vh",
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(10),
    background: "linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)",
  },
  glassCard: {
    maxWidth: 1120,
    width: "100%",
    margin: "auto",
    padding: theme.spacing(4),
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(5, 150, 105, 0.15)",
    border: "1px solid rgba(209, 250, 229, 0.8)",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
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
    maxWidth: 720,
    margin: "0 auto",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: theme.spacing(2.5),
    marginBottom: theme.spacing(4),
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: theme.spacing(3),
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 10px 25px rgba(5, 150, 105, 0.1)",
    },
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#064e3b",
    fontFamily: "'Outfit', sans-serif",
  },
  statLabel: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: 4,
  },
  cityCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: theme.spacing(3.5),
    marginBottom: theme.spacing(3.5),
    transition: "all 0.3s ease",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.04)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 28px rgba(5, 150, 105, 0.12)",
    },
  },
  riskCritical: {
    borderLeft: "6px solid #dc2626",
    background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
  },
  riskHigh: {
    borderLeft: "6px solid #f97316",
    background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
  },
  riskModerate: {
    borderLeft: "6px solid #f59e0b",
    background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
  },
  riskLow: {
    borderLeft: "6px solid #10b981",
    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
  },
  cityHeaderTitle: {
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.35rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  threatBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  metricPill: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    background: "#ffffff",
    padding: theme.spacing(1.2, 2),
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  chemicalBox: {
    background: "#f0fdf4",
    border: "1.5px solid #a7f3d0",
    borderRadius: "14px",
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },
  chemicalTitle: {
    fontWeight: 700,
    color: "#047857",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  chemicalName: {
    fontWeight: 800,
    color: "#064e3b",
    fontSize: "1.05rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginTop: 4,
  },
}));

const SINDH_OUTBREAK_DATA = [
  {
    city: "Sukkur",
    district: "Sukkur District, Sindh",
    riskLevel: "HIGH_RISK",
    primaryThreat: "Bacterial Blight & High Humidity",
    temp: "34.2°C",
    wind: "14.5 km/h",
    humidity: "78%",
    affectedAcres: "420 Acres",
    recommendedChemical: "Copper Oxychloride @ 250g/acre + Streptocycline @ 6g/acre",
    statusBadge: { label: "HIGH THREAT ALERT", style: { background: "#f97316", color: "#fff", fontWeight: 800 } },
  },
  {
    city: "Khairpur",
    district: "Khairpur Mirs, Sindh",
    riskLevel: "MODERATE_RISK",
    primaryThreat: "Aphids (Sucking Pest Aggregation)",
    temp: "35.8°C",
    wind: "11.2 km/h",
    humidity: "62%",
    affectedAcres: "310 Acres",
    recommendedChemical: "Imidacloprid 200 SL @ 60 ml/acre",
    statusBadge: { label: "MODERATE THREAT", style: { background: "#f59e0b", color: "#000", fontWeight: 800 } },
  },
  {
    city: "Gambat",
    district: "Khairpur District, Sindh",
    riskLevel: "CRITICAL_RISK",
    primaryThreat: "Fall Armyworm (Nocturnal Caterpillars)",
    temp: "33.5°C",
    wind: "9.8 km/h",
    humidity: "71%",
    affectedAcres: "580 Acres",
    recommendedChemical: "Emamectin Benzoate 5% SG @ 75g/acre (Evening Spray)",
    statusBadge: { label: "CRITICAL OUTBREAK", style: { background: "#dc2626", color: "#fff", fontWeight: 800 } },
  },
  {
    city: "Ghotki",
    district: "Ghotki District, Sindh",
    riskLevel: "LOW_RISK",
    primaryThreat: "Powdery Mildew (Early Symptoms)",
    temp: "36.4°C",
    wind: "12.0 km/h",
    humidity: "52%",
    affectedAcres: "140 Acres",
    recommendedChemical: "Water-Soluble Sulfur @ 1 kg/acre",
    statusBadge: { label: "LOW THREAT / OPTIMAL", style: { background: "#10b981", color: "#fff", fontWeight: 800 } },
  },
  {
    city: "Rohri",
    district: "Sukkur District, Sindh",
    riskLevel: "MODERATE_RISK",
    primaryThreat: "Target Spot Fungal Lesions",
    temp: "34.8°C",
    wind: "13.1 km/h",
    humidity: "68%",
    affectedAcres: "210 Acres",
    recommendedChemical: "Azoxystrobin + Difenoconazole @ 200 ml/acre",
    statusBadge: { label: "MODERATE THREAT", style: { background: "#f59e0b", color: "#000", fontWeight: 800 } },
  },
];

const OutbreakRadar = () => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("ALL");

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

  return (
    <Container className={classes.mainContainer}>
      <Card className={classes.glassCard}>
        {/* HEADER SECTION */}
        <div className={classes.headerSection}>
          <Box display="inline-flex" alignItems="center" gridGap={8} mb={1.5}>
            <FaSatellite style={{ color: "#059669", fontSize: "1.5rem" }} />
            <Chip
              label="Real-Time OpenWeatherMap & AI Regional Satellite Feed"
              style={{ background: "#d1fae5", color: "#064e3b", fontWeight: 800 }}
              size="small"
            />
          </Box>

          <Typography variant="h3" className={classes.mainTitle}>
            Sindh Cotton Disease Outbreak Radar
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Geospatial surveillance & micro-climate threat tracking across Sukkur, Khairpur, Gambat, Ghotki, and Sindh cotton belts.
          </Typography>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className={classes.statsRow}>
          <div className={classes.statCard}>
            <div className={classes.statNumber}>1,660</div>
            <div className={classes.statLabel}>Monitored Cotton Acres</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNumber} style={{ color: "#dc2626" }}>3 Zones</div>
            <div className={classes.statLabel}>Active Threat Outbreaks</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNumber} style={{ color: "#059669" }}>84%</div>
            <div className={classes.statLabel}>Regional Crop Health</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNumber} style={{ color: "#0284c7" }}>5 Cities</div>
            <div className={classes.statLabel}>Live Satellite Feed</div>
          </div>
        </div>

        {/* SEARCH & RISK FILTER PILLS */}
        <Box mb={4}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search by city or pathogen e.g. Sukkur, Bacterial Blight, Armyworm..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ background: "#ffffff", borderRadius: "14px" }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box display="flex" gridGap={8} flexWrap="wrap">
                {["ALL", "HIGH", "MODERATE", "LOW"].map((filter) => (
                  <Chip
                    key={filter}
                    label={filter === "ALL" ? "All Zones" : `${filter} Risk`}
                    clickable
                    color={selectedRiskFilter === filter ? "primary" : "default"}
                    onClick={() => setSelectedRiskFilter(filter)}
                    style={{
                      fontWeight: 700,
                      backgroundColor: selectedRiskFilter === filter ? "#059669" : "#e2e8f0",
                      color: selectedRiskFilter === filter ? "#ffffff" : "#334155",
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CITY OUTBREAK CARDS */}
        <div>
          {filteredCities.map((item, idx) => {
            const riskClass =
              item.riskLevel === "CRITICAL_RISK"
                ? classes.riskCritical
                : item.riskLevel === "HIGH_RISK"
                ? classes.riskHigh
                : item.riskLevel === "MODERATE_RISK"
                ? classes.riskModerate
                : classes.riskLow;

            return (
              <div key={idx} className={`${classes.cityCard} ${riskClass}`}>
                {/* CITY HEADER & STATUS BADGE */}
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gridGap={12}>
                  <div>
                    <Typography variant="h5" className={classes.cityHeaderTitle}>
                      <FaMapMarkerAlt style={{ color: "#059669" }} /> {item.city}
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#64748b" }}>({item.district})</span>
                    </Typography>
                  </div>

                  <Chip {...item.statusBadge} />
                </Box>

                {/* THREAT BOX */}
                <div className={classes.threatBox}>
                  <Typography variant="caption" style={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    PRIMARY PATHOGEN & ENVIRONMENTAL THREAT
                  </Typography>
                  <Typography variant="body1" style={{ fontWeight: 800, color: "#0f172a", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <FaBug style={{ color: "#ef4444" }} /> {item.primaryThreat}
                  </Typography>
                </div>

                {/* WEATHER & METRICS GRID */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <div className={classes.metricPill}>
                      <FaThermometerHalf style={{ color: "#eab308" }} />
                      <span>{item.temp}</span>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <div className={classes.metricPill}>
                      <FaWind style={{ color: "#0284c7" }} />
                      <span>{item.wind}</span>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <div className={classes.metricPill}>
                      <FaTint style={{ color: "#2563eb" }} />
                      <span>{item.humidity} RH</span>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <div className={classes.metricPill} style={{ background: "#f0fdf4", borderColor: "#a7f3d0" }}>
                      <FaChartLine style={{ color: "#059669" }} />
                      <span>{item.affectedAcres}</span>
                    </div>
                  </Grid>
                </Grid>

                {/* CHEMICAL FORMULATION (ENGLISH) */}
                <div className={classes.chemicalBox}>
                  <Typography variant="caption" className={classes.chemicalTitle}>
                    <FaFlask /> RECOMMENDED CHEMICAL SPRAY (ENGLISH FORMULATION)
                  </Typography>
                  <Typography variant="body1" className={classes.chemicalName}>
                    {item.recommendedChemical}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default OutbreakRadar;
