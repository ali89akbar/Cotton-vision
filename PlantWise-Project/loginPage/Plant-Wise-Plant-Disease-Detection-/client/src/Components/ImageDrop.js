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
} from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import ClearIcon from "@material-ui/icons/Clear";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
    padding: theme.spacing(2),
  },
  card: {
    maxWidth: 700,
    width: "100%",
    margin: "auto",
    padding: theme.spacing(4),
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    borderRadius: "20px",
    backgroundColor: "#fff",
  },
  loader: {
    margin: theme.spacing(2),
  },
  dataContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    textAlign: "left",
  },
  dataRow: {
    marginBottom: theme.spacing(1.5),
    fontSize: "16px",
  },
  dataLabel: {
    fontWeight: 600,
    marginRight: theme.spacing(1),
    color: "#555",
  },
  badgeMessage: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    background: "#e8f5e9",
    color: "#2e7d32",
    fontWeight: "bold",
    borderRadius: "12px",
    fontSize: "16px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  clearButton: {
    width: "140px",
    borderRadius: "30px",
    padding: "10px 0",
    fontSize: "14px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
}));

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))(Button);

export const ImageUpload = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState(null);
  const [data, setData] = useState(null);
  const [careRoutine, setCareRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [generatingRoutine, setGeneratingRoutine] = useState(false);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
  });

  const axiosDatabase = axios.create({
    baseURL: "http://127.0.0.1:6005",
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

  const generateCareRoutineWithGroq = async (diseaseName) => {
  setGeneratingRoutine(true);
  try {
    const response = await axios.post(
      "http://localhost:6005/generate-care-routine",
      { diseaseName },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000 // 30 second timeout
      }
    );

    // Handle both success and fallback cases
    const routineData = response.data.usedFallback 
      ? {
          ...response.data.fallbackRoutine,
          isFallback: true,
          error: response.data.details
        }
      : {
          ...response.data,
          isFallback: false
        };

    setCareRoutine(routineData);

    if (response.data.usedFallback) {
      console.warn("Used fallback routine:", response.data.details);
      // Optional: Show toast notification to user
      alert(`Note: Using fallback routine. ${response.data.details}`);
    }

  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    // Ultimate fallback
    setCareRoutine({
      morningCareRoutine: [
        "1. Check plant health status",
        "2. Water as needed (avoid overwatering)",
        "3. Isolate plant if disease is contagious",
        "4. Ensure proper sunlight",
        "5. Monitor for changes"
      ],
      nightCareRoutine: [
        "1. Evening inspection with flashlight",
        "2. Adjust plant position if needed",
        "3. Light misting if humidity is low",
        "4. Check soil moisture depth",
        "5. Prepare supplies for next day"
      ],
      isFallback: true,
      error: "Connection failed. Using local fallback."
    });
    
    alert("Network error. Using basic care instructions.");
  } finally {
    setGeneratingRoutine(false);
  }
};

  const sendFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/predict", formData);
      if (response.status === 200) {
        const prediction = response.data;
        setData(prediction);
        await generateCareRoutineWithGroq(prediction.class);
      }
    } catch (error) {
      console.error("Error sending file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePrediction = async () => {
  if (!data?.class || !careRoutine) {
    alert("Prediction or care routine data is missing.");
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:6005/save-prediction",
      {
        className: data.class,
        morningCareRoutine: careRoutine.morningCareRoutine,
        nightCareRoutine: careRoutine.nightCareRoutine
      },
      {
        withCredentials: true, // This is crucial
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      alert("Prediction saved successfully!");
      setBadgeEarned(true);
    }
  } catch (error) {
    console.error("Error saving prediction:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.status === 401) {
      alert("Session expired. Please log in again.");
      navigate('/login');
    } else {
      alert("An error occurred while saving the prediction.");
    }
  }
};

  const clearData = () => {
    setData(null);
    setCareRoutine(null);
    setSelectedFile(null);
    setBadgeEarned(false);
  };

  useEffect(() => {
    if (selectedFile) {
      sendFile();
    }
  }, [selectedFile]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap>
            🌿 Plant Disease Detection System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container className={classes.mainContainer}>
        <Card className={classes.card}>
          {!selectedFile && (
            <DropzoneArea
              acceptedFiles={["image/*"]}
              dropzoneText={"Drag and drop an image or click to upload"}
              onChange={handleFileChange}
              filesLimit={1}
              showAlerts={false}
            />
          )}

          {(isLoading || generatingRoutine) && (
            <div>
              <CircularProgress className={classes.loader} />
              <Typography>
                {isLoading ? "Processing image..." : "Generating care routine..."}
              </Typography>
            </div>
          )}

          {data && (
            <div className={classes.dataContainer}>
              <div className={classes.dataRow}>
                <span className={classes.dataLabel}>Disease Name:</span>
                <span>{data.class}</span>
              </div>
              <div className={classes.dataRow}>
                <span className={classes.dataLabel}>Accuracy:</span>
                <span>{(parseFloat(data.confidence) * 100).toFixed(2)}%</span>
              </div>
              <div className={classes.dataRow}>
                <span className={classes.dataLabel}>Morning Care Routine:</span>
                {careRoutine?.morningCareRoutine ? (
                  <ul>
                    {careRoutine.morningCareRoutine.map((step, idx) => (
                      <li key={`morning-${idx}`}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <span>Loading morning routine...</span>
                )}
              </div>
              <div className={classes.dataRow}>
                <span className={classes.dataLabel}>Night Care Routine:</span>
                {careRoutine?.nightCareRoutine ? (
                  <ul>
                    {careRoutine.nightCareRoutine.map((step, idx) => (
                      <li key={`night-${idx}`}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <span>Loading night routine...</span>
                )}
              </div>
            </div>
          )}

          {badgeEarned && (
            <div className={classes.badgeMessage}>
              🎉 Congratulations! You've earned a badge for detecting a plant disease!
            </div>
          )}

          {data && (
            <div className={classes.buttonGroup}>
              <ColorButton
                variant="contained"
                className={classes.clearButton}
                onClick={clearData}
              >
                Clear
              </ColorButton>
              <ColorButton
                variant="contained"
                className={classes.clearButton}
                onClick={savePrediction}
                disabled={!careRoutine}
              >
                Save
              </ColorButton>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
};