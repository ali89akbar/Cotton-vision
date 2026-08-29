import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Box,
  Divider,
} from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
    padding: theme.spacing(3),
  },
  card: {
    maxWidth: 780,
    width: "100%",
    margin: "auto",
    padding: theme.spacing(4),
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
  },
  titleHeader: {
    fontWeight: 700,
    color: "#1b5e20",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#555",
    marginBottom: theme.spacing(3),
  },
  cityInputContainer: {
    marginBottom: theme.spacing(3),
    display: "flex",
    gap: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    margin: theme.spacing(3),
    color: "#2e7d32",
  },
  dataContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    background: "#f8faf8",
    border: "1px solid #c8e6c9",
    borderRadius: "16px",
    textAlign: "left",
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  diseaseTitle: {
    fontWeight: 700,
    fontSize: "22px",
    color: "#1b5e20",
  },
  urduTitle: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#2e7d32",
    direction: "rtl",
    marginBottom: theme.spacing(1),
  },
  dataRow: {
    marginBottom: theme.spacing(2),
    fontSize: "15px",
    lineHeight: "1.6",
  },
  dataLabel: {
    fontWeight: 700,
    marginRight: theme.spacing(1),
    color: "#333",
  },
  chemicalBox: {
    background: "#e8f5e9",
    borderLeft: "5px solid #2e7d32",
    padding: theme.spacing(2),
    borderRadius: "8px",
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
  weatherWarningBox: {
    background: "#fff3e0",
    borderLeft: "5px solid #ef6c00",
    padding: theme.spacing(2),
    borderRadius: "8px",
    marginTop: theme.spacing(2),
    color: "#e65100",
    fontWeight: 600,
  },
  lowConfidenceBox: {
    background: "#ffebee",
    borderLeft: "5px solid #c62828",
    padding: theme.spacing(2.5),
    borderRadius: "12px",
    color: "#c62828",
    textAlign: "left",
    marginTop: theme.spacing(2),
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  actionButton: {
    minWidth: "140px",
    borderRadius: "30px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
}));

const ColorButton = withStyles((theme) => ({
  root: {
    color: "#fff",
    backgroundColor: "#2e7d32",
    "&:hover": {
      backgroundColor: "#1b5e20",
    },
  },
}))(Button);

export const ImageUpload = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState(null);
  const [cityName, setCityName] = useState("Khairpur");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
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

  const sendFile = async (fileToUpload = selectedFile) => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        `/predict?city=${encodeURIComponent(cityName)}&confidence_threshold=0.70`,
        formData
      );
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error sending file:", error);
      alert("Error connecting to Plantwise Model API server (http://localhost:8000). Ensure main.py is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
  };

  useEffect(() => {
    if (selectedFile) {
      sendFile(selectedFile);
    }
  }, [selectedFile]);

  const getUrgencyChipColor = (urgency) => {
    switch (urgency) {
      case "CRITICAL":
        return { bg: "#d32f2f", text: "#fff" };
      case "HIGH":
        return { bg: "#f57c00", text: "#fff" };
      case "MODERATE_TO_HIGH":
      case "MODERATE":
        return { bg: "#fbc02d", text: "#000" };
      default:
        return { bg: "#388e3c", text: "#fff" };
    }
  };

  const weatherSafety = data?.weather_safety_advisory || data?.weather_safety_khairpur;

  return (
    <>
      <AppBar position="static" style={{ background: "#1b5e20" }}>
        <Toolbar>
          <Typography variant="h6" style={{ fontWeight: 700, flexGrow: 1 }}>
            🌱 Plantwise Detection - Cotton Crop Decision Engine
          </Typography>
          <Typography variant="subtitle2" style={{ color: "#a5d6a7" }}>
            {data?.region || `${cityName}, Sindh, Pakistan`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container className={classes.mainContainer}>
        <Card className={classes.card}>
          <Typography variant="h4" className={classes.titleHeader}>
            Cotton Leaf Disease Detection
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            Upload a cotton leaf photo for instant disease diagnosis, per-acre chemical dosage, and real-time weather spray advisories.
          </Typography>

          <div className={classes.cityInputContainer}>
            <TextField
              label="Location City / Village"
              variant="outlined"
              size="small"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Sukkur, Khairpur, Gambat, Kot Diji"
              helperText="Live weather will be automatically fetched for this location"
              style={{ minWidth: 300 }}
            />
          </div>

          {!selectedFile && (
            <DropzoneArea
              acceptedFiles={["image/*"]}
              dropzoneText={"Drag and drop a cotton leaf image here, or click to browse"}
              onChange={handleFileChange}
              filesLimit={1}
              showAlerts={false}
            />
          )}

          {isLoading && (
            <div>
              <CircularProgress className={classes.loader} />
              <Typography variant="h6" style={{ color: "#2e7d32" }}>
                Running AI model inference & fetching live {cityName} weather...
              </Typography>
            </div>
          )}

          {/* LOW CONFIDENCE RESPONSE */}
          {data && data.status === "LOW_CONFIDENCE" && (
            <div className={classes.lowConfidenceBox}>
              <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
                ⚠️ Low Prediction Confidence ({(data.confidence * 100).toFixed(1)}%)
              </Typography>
              <Typography variant="subtitle2" style={{ fontWeight: 600, color: "#b71c1c", marginBottom: 8 }}>
                Region: {data.region}
              </Typography>
              <Typography variant="body1">
                {data.action_required}
              </Typography>
            </div>
          )}

          {/* SUCCESS ADVISORY RESPONSE */}
          {data && data.status === "SUCCESS" && (
            <div className={classes.dataContainer}>
              <div className={classes.headerSection}>
                <div>
                  <Typography className={classes.diseaseTitle}>
                    {data.diagnosis.predicted_class}
                  </Typography>
                  <Typography className={classes.urduTitle}>
                    {data.diagnosis.disease_name_urdu}
                  </Typography>
                  <Typography variant="caption" style={{ color: "#2e7d32", fontWeight: 600 }}>
                    Target Region: {data.region}
                  </Typography>
                </div>
                <Box display="flex" alignItems="center" gridGap={8}>
                  <Chip
                    label={`Urgency: ${data.actionable_decision.urgency_level}`}
                    style={{
                      backgroundColor: getUrgencyChipColor(data.actionable_decision.urgency_level).bg,
                      color: getUrgencyChipColor(data.actionable_decision.urgency_level).text,
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={`Confidence: ${data.diagnosis.confidence_percentage}%`}
                    color="primary"
                    variant="outlined"
                    style={{ fontWeight: 700 }}
                  />
                </Box>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              <div className={classes.chemicalBox}>
                <Typography variant="h6" style={{ fontWeight: 700, color: "#1b5e20", marginBottom: 6 }}>
                  💊 Actionable Chemical Remedy
                </Typography>
                <div className={classes.dataRow}>
                  <span className={classes.dataLabel}>Spray Formulation:</span>
                  <span>{data.actionable_decision.chemical_recommendation}</span>
                </div>
                <div className={classes.dataRow}>
                  <span className={classes.dataLabel}>Dosage Per Acre:</span>
                  <span>{data.actionable_decision.dosage_per_acre}</span>
                </div>
                <div className={classes.dataRow}>
                  <span className={classes.dataLabel}>Application Timing:</span>
                  <span>{data.actionable_decision.application_instructions}</span>
                </div>
              </div>

              <div className={classes.dataRow}>
                <span className={classes.dataLabel}>Agronomic Context:</span>
                <span>{data.actionable_decision.agronomic_context_sindh}</span>
              </div>

              {/* WEATHER SAFETY ADVISORY SECTION */}
              {weatherSafety && (
                <div className={weatherSafety.can_spray ? classes.chemicalBox : classes.weatherWarningBox}>
                  <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 6 }}>
                    🌦️ Live Weather Spray Safety for {data.region} ({weatherSafety.conditions_assessed.temperature_c}°C, {weatherSafety.conditions_assessed.wind_speed_kmh} km/h wind, {weatherSafety.conditions_assessed.humidity_pct}% humidity)
                  </Typography>

                  <div className={classes.dataRow}>
                    <span className={classes.dataLabel}>Spray Status:</span>
                    <span>{weatherSafety.can_spray ? "✅ SAFE TO SPRAY" : "⛔ SPRAYING TEMPORARILY POSTPONED"}</span>
                  </div>

                  <div className={classes.dataRow}>
                    <span className={classes.dataLabel}>Recommended Time Window:</span>
                    <span>{weatherSafety.recommended_window}</span>
                  </div>

                  {weatherSafety.weather_warnings && weatherSafety.weather_warnings.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {weatherSafety.weather_warnings.map((warn, i) => (
                        <div key={i} style={{ color: "#d84315", fontWeight: 700 }}>
                          • {warn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {data && (
            <div className={classes.buttonGroup}>
              <ColorButton
                variant="contained"
                className={classes.actionButton}
                onClick={clearData}
              >
                Upload Another Photo
              </ColorButton>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
};