import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiCheckCircle, FiAward, FiLock } from "react-icons/fi";
import styled, { keyframes } from "styled-components";
import { useNotification } from './NotificationContext';
import './savedPlants.css';

// Modern color palette inspired by nature
const colors = {
  primary: "#059669",
  primaryLight: "#10b981",
  primaryDark: "#064e3b",
  secondary: "#f59e0b",
  background: "#F5F5F5",
  cardBg: "#FFFFFF",
  text: "#333333",
  textLight: "#757575",
  border: "#E0E0E0",
  success: "#059669",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0284c7",
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 7.5rem 1.5rem 3.5rem 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2.25rem;
  color: ${colors.primaryDark};
  margin-bottom: 0.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  color: ${colors.textLight};
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.6;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  margin-top: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const EmptyImage = styled.img`
  max-width: 200px;
  margin-bottom: 1.5rem;
  opacity: 0.8;
`;

const EmptyTitle = styled.h3`
  color: ${colors.text};
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: ${colors.textLight};
  max-width: 400px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(5, 150, 105, 0.2);
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textLight};
  font-size: 1rem;
`;

// Helper to generate 5 point-wise recommendation steps for check marks
const getPointWiseSteps = (prediction) => {
  const steps = [];

  if (prediction.chemicalRecommendation) {
    steps.push(`Apply Chemical Formulation: ${prediction.chemicalRecommendation}`);
  } else {
    steps.push(`Apply recommended spray formula for ${prediction.className}`);
  }

  if (prediction.dosagePerAcre) {
    steps.push(`Prepare exact per-acre dosage: ${prediction.dosagePerAcre}`);
  } else {
    steps.push("Prepare per-acre dosage in 100L water per acre");
  }

  steps.push("Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat/wind drift");
  steps.push("Ensure thorough spray coverage on both lower and upper leaf surfaces");

  if (prediction.recommendation) {
    steps.push(`Qwen AI Field Rule: ${prediction.recommendation}`);
  }

  return steps;
};

const SavedPlants = () => {
  const [predictions, setPredictions] = useState([]);
  const [checkedMap, setCheckedMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const notify = useNotification();

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

  const getStorageKey = (prediction, index) => {
    const id = prediction._id || prediction.className;
    return `plantwise_checklist_${id}_${index}`;
  };

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const predictionsRes = await axios.get("http://localhost:6005/api/predictions", {
        withCredentials: true,
      });
      const data = predictionsRes.data || [];
      setPredictions(data);

      // Restore checked states from localStorage or MongoDB badge status
      const initialChecked = {};
      data.forEach((p, pIdx) => {
        const steps = getPointWiseSteps(p);
        const key = getStorageKey(p, pIdx);
        const savedJson = localStorage.getItem(key);

        if (savedJson) {
          try {
            initialChecked[pIdx] = JSON.parse(savedJson);
          } catch (e) {
            initialChecked[pIdx] = steps.map(() => p.badgeEarned || false);
          }
        } else {
          initialChecked[pIdx] = steps.map(() => p.badgeEarned || false);
        }
      });
      setCheckedMap(initialChecked);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: '7.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)' }}>
        <div style={{ padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: 500, background: '#ffffff', margin: '0 1rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#e6f4ea', color: '#059669', fontSize: 32, marginBottom: 16 }}>
            📌
          </div>
          <h2 style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '1.5rem', marginBottom: 10 }}>
            🔒 Registered Farmer Access Only
          </h2>
          <p style={{ marginTop: 10, color: '#475569', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem' }}>
            Please log in with your account to view your saved crop scans, per-acre treatment checklists, and spray routine progress.
          </p>
          <button
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 30px', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/login'}
          >
            🔑 LOGIN TO ACCESS SAVED PLANTS
          </button>
        </div>
      </div>
    );
  }

  const handleStepToggle = async (plantIndex, stepIndex) => {
    const currentPlant = predictions[plantIndex];
    const steps = getPointWiseSteps(currentPlant);
    const currentPlantChecked = [...(checkedMap[plantIndex] || steps.map(() => false))];

    // IF ALL ITEMS ARE ALREADY TICKS (COMPLETED & LOCKED), PREVENT ANY CHANGE!
    const alreadyAllChecked = currentPlantChecked.length > 0 && currentPlantChecked.every(Boolean);
    if (alreadyAllChecked || currentPlant.badgeEarned) {
      return; // Locked! Cannot be modified once fully completed.
    }

    currentPlantChecked[stepIndex] = !currentPlantChecked[stepIndex];

    const updatedCheckedMap = {
      ...checkedMap,
      [plantIndex]: currentPlantChecked,
    };
    setCheckedMap(updatedCheckedMap);

    // Save to localStorage so check marks persist on refresh!
    const key = getStorageKey(currentPlant, plantIndex);
    localStorage.setItem(key, JSON.stringify(currentPlantChecked));

    const nowAllChecked = currentPlantChecked.every(Boolean);

    // If ALL check marks are now checked, award badge and LOCK!
    if (nowAllChecked && !currentPlant.badgeEarned) {
      try {
        await axios.post(
          "http://localhost:6005/api/user/mark-care",
          { className: currentPlant.className, routineType: "morning" },
          { withCredentials: true }
        );

        notify.alert(
          '🏆 Care Master Badge Earned!',
          `Congratulations! You completed all point-wise recommendations for ${currentPlant.className}.\n\nThis checklist is now permanently completed and locked.`
        );

        const updatedPredictions = [...predictions];
        updatedPredictions[plantIndex].badgeEarned = true;
        setPredictions(updatedPredictions);
      } catch (err) {
        console.error("Error marking care complete:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading saved plants & point-wise recommendations...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Saved Cotton Plants & Recommendations</Title>
        <Subtitle>
          Complete point-wise recommendation steps for each saved plant disease. Check off all steps to earn your 🏆 Care Master Badge!
        </Subtitle>
      </Header>

      {predictions.length > 0 ? (
        <div className="sp-grid">
          {predictions.map((prediction, pIdx) => {
            const steps = getPointWiseSteps(prediction);
            const plantChecked = checkedMap[pIdx] || steps.map(() => false);
            const completedCount = plantChecked.filter(Boolean).length;
            const progressPercent = Math.round((completedCount / steps.length) * 100);
            const isFullyCompleted = (completedCount === steps.length && steps.length > 0) || prediction.badgeEarned;

            return (
              <div key={pIdx} className="sp-card">
                {/* 2. HEADER SECTION (TYPOGRAPHY & BADGES) */}
                <div className="sp-card-header">
                  <div className="sp-header-left">
                    <span className="sp-crop-badge">
                      Cotton Crop Disease Diagnosis
                    </span>
                    <h2 className="sp-disease-title">
                      {prediction.className}
                    </h2>
                  </div>

                  {prediction.region && (
                    <span className="sp-location-badge">
                      <span>📍</span> {prediction.region}
                    </span>
                  )}
                </div>

                {/* 3. REMEDY HIGHLIGHT BOX */}
                {prediction.chemicalRecommendation && (
                  <div className="sp-remedy-box">
                    <div className="sp-remedy-label">
                      <span>💊</span> Chemical Spray Remedy (English Product)
                    </div>
                    <div className="sp-remedy-name">
                      {prediction.chemicalRecommendation}
                    </div>
                  </div>
                )}

                {/* 4. MODERN CHECKLIST SECTION */}
                <div className="sp-checklist-box">
                  <div className="sp-checklist-title">
                    <span>📝 Point-Wise Recommendation Checklist</span>
                    {isFullyCompleted ? (
                      <span className="sp-checklist-badge locked">
                        <FiLock /> Completed & Locked
                      </span>
                    ) : (
                      <span className="sp-checklist-badge">
                        {completedCount}/{steps.length} Done
                      </span>
                    )}
                  </div>

                  <div className="sp-checklist-items">
                    {steps.map((stepText, sIdx) => {
                      const isChecked = plantChecked[sIdx] || false;
                      return (
                        <label
                          key={sIdx}
                          className={`sp-checklist-item ${isChecked ? 'checked' : ''} ${isFullyCompleted ? 'locked' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleStepToggle(pIdx, sIdx);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="sp-checkbox"
                          />
                          <span className={`sp-item-text ${isChecked ? 'checked' : ''}`}>
                            {stepText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* PROGRESS BAR & BADGE BANNER */}
                <div className="sp-progress-section">
                  <div className="sp-progress-label">
                    <span>Checklist Completion</span>
                    <span className="sp-progress-val">{progressPercent}%</span>
                  </div>
                  <div className="sp-progress-track">
                    <div
                      className="sp-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {isFullyCompleted && (
                  <div className="sp-badge-earned">
                    <FiAward style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                    <span>🏆 {prediction.className} Care Master Badge Earned!</span>
                  </div>
                )}

                {/* 5. FOOTER & CALL TO ACTION BUTTON */}
                <div className="sp-card-footer">
                  <div className="sp-date">
                    Saved: {new Date(prediction.timestamp || Date.now()).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() =>
                      notify.info(
                        'Checklist Progress',
                        `Completed ${completedCount}/${steps.length} checklist steps for ${prediction.className}`
                      )
                    }
                    className="sp-btn-action"
                  >
                    <FiCheckCircle style={{ fontSize: '1.1rem' }} /> View Routine
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState>
          <EmptyImage src="/images/no-plants.svg" alt="No plants saved" />
          <EmptyTitle>No plants saved yet</EmptyTitle>
          <EmptyText>
            Detect cotton diseases on the AI Scanner Dashboard and click "Save Diagnosis to My Saved Plants" to start completing point-wise recommendation checklists and earning badges!
          </EmptyText>
        </EmptyState>
      )}
    </Container>
  );
};

export default SavedPlants;