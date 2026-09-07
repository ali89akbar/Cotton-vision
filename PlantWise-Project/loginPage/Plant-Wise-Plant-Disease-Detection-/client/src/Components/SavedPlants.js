import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiLock, FiEye, FiChevronRight, FiCheck, FiList } from "react-icons/fi";
import { useNotification } from './NotificationContext';
import './savedPlants.css';

// Reusable dummy dataset matching reference UI layout
const DEFAULT_SAMPLE_PLANTS = [
  {
    _id: "sample-1",
    className: "Potato___Late_blight",
    cropCategory: "COTTON CROP DISEASE DIAGNOSIS",
    badgeEarned: true,
    timestamp: "24/06/2025",
    imgUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=160&q=80",
    steps: [
      "Apply recommended spray formulation (For late_blight control)",
      "Prepare pre-rose dosage in 100L water per acre",
      "Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat and drift."
    ]
  },
  {
    _id: "sample-2",
    className: "Potato___Early_blight",
    cropCategory: "COTTON CROP DISEASE DIAGNOSIS",
    badgeEarned: true,
    timestamp: "24/06/2025",
    imgUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=160&q=80",
    steps: [
      "Apply recommended spray formulation (For early_blight control)",
      "Prepare pre-rose dosage in 100L water per acre",
      "Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat and drift."
    ]
  },
  {
    _id: "sample-3",
    className: "Tomato___Early_blight",
    cropCategory: "COTTON CROP DISEASE DIAGNOSIS",
    badgeEarned: false,
    timestamp: "20/06/2025",
    imgUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=160&q=80",
    steps: [
      "Apply recommended spray formulation (Tomato___Early_blight)",
      "Prepare pre-rose dosage in 100L water per acre",
      "Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat and drift."
    ]
  },
  {
    _id: "sample-4",
    className: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    cropCategory: "COTTON CROP DISEASE DIAGNOSIS",
    badgeEarned: true,
    timestamp: "20/06/2025",
    imgUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=160&q=80",
    steps: [
      "Apply recommended spray formulation (Tomato___Tomato_Yellow_Leaf_Curl_Virus)",
      "Prepare pre-rose dosage in 100L water per acre",
      "Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat and drift."
    ]
  }
];

// Helper to generate 3-4 point-wise recommendation steps
const getPointWiseSteps = (prediction) => {
  if (prediction.steps && prediction.steps.length > 0) {
    return prediction.steps;
  }

  const steps = [];
  if (prediction.chemicalRecommendation) {
    steps.push(`Apply Chemical formulation (${prediction.chemicalRecommendation})`);
  } else {
    steps.push(`Apply recommended spray formulation (${prediction.className})`);
  }

  if (prediction.dosagePerAcre) {
    steps.push(`Prepare pre-rose dosage: ${prediction.dosagePerAcre}`);
  } else {
    steps.push("Prepare pre-rose dosage in 100L water per acre");
  }

  steps.push("Spray during Early Morning (6:00-9:00 AM) or Evening to avoid high heat and drift.");
  return steps;
};

// Smart thumbnail image resolver: returns the exact scanned image if available
const getCropThumbnail = (prediction) => {
  if (prediction.imgUrl && prediction.imgUrl.length > 10) {
    return prediction.imgUrl;
  }
  if (prediction.imagePath && prediction.imagePath.length > 5) {
    if (prediction.imagePath.startsWith('http') || prediction.imagePath.startsWith('data:')) {
      return prediction.imagePath;
    }
    return `http://localhost:6005/${prediction.imagePath.replace(/\\/g, '/')}`;
  }

  // Disease specific realistic high resolution fallback images
  const className = (prediction.className || "").toLowerCase();
  if (className.includes("target")) {
    return "https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=200&q=80";
  }
  if (className.includes("bacterial") || className.includes("blight")) {
    return "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=200&q=80";
  }
  if (className.includes("healthy")) {
    return "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=200&q=80";
  }
  return "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=200&q=80";
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
      const listToUse = data.length > 0 ? data : DEFAULT_SAMPLE_PLANTS;
      setPredictions(listToUse);

      const initialChecked = {};
      listToUse.forEach((p, pIdx) => {
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
      setPredictions(DEFAULT_SAMPLE_PLANTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPredictions();
    } else if (!authLoading) {
      setPredictions(DEFAULT_SAMPLE_PLANTS);
      const initialChecked = {};
      DEFAULT_SAMPLE_PLANTS.forEach((p, pIdx) => {
        initialChecked[pIdx] = p.steps.map(() => p.badgeEarned || false);
      });
      setCheckedMap(initialChecked);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleStepToggle = async (plantIndex, stepIndex) => {
    const listToUse = predictions.length > 0 ? predictions : DEFAULT_SAMPLE_PLANTS;
    const currentPlant = listToUse[plantIndex];
    const steps = getPointWiseSteps(currentPlant);
    const currentPlantChecked = [...(checkedMap[plantIndex] || steps.map(() => false))];

    const alreadyAllChecked = currentPlantChecked.length > 0 && currentPlantChecked.every(Boolean);
    if (alreadyAllChecked || currentPlant.badgeEarned) {
      return; // Locked once fully completed
    }

    currentPlantChecked[stepIndex] = !currentPlantChecked[stepIndex];

    const updatedCheckedMap = {
      ...checkedMap,
      [plantIndex]: currentPlantChecked,
    };
    setCheckedMap(updatedCheckedMap);

    const key = getStorageKey(currentPlant, plantIndex);
    localStorage.setItem(key, JSON.stringify(currentPlantChecked));

    const nowAllChecked = currentPlantChecked.every(Boolean);

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

        const updatedPredictions = [...listToUse];
        updatedPredictions[plantIndex].badgeEarned = true;
        setPredictions(updatedPredictions);
      } catch (err) {
        console.error("Error marking care complete:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="sp-bg-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTop: '4px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16, color: '#64748b' }}>Loading saved plants & recommendations...</p>
      </div>
    );
  }

  const activeCards = predictions.length > 0 ? predictions : DEFAULT_SAMPLE_PLANTS;

  return (
    <div className="sp-bg-wrapper">
      {/* Generated Cotton Leaves & Bolls Background Images */}
      <img src="/images/cotton_leaves_clean.jpg" className="sp-bg-decor left-top" alt="cotton leaf background" />
      <img src="/images/cotton_leaves_clean.jpg" className="sp-bg-decor left-bottom" alt="cotton leaf background" />
      <img src="/images/cotton_bolls_clean.jpg" className="sp-bg-decor right-top" alt="cotton bolls background" />
      <img src="/images/cotton_bolls_clean.jpg" className="sp-bg-decor right-bottom" alt="cotton bolls background" />

      <div className="sp-main-container">
        {/* 1. Page Header (Main Area) */}
        <div className="sp-header-area">
          <div className="sp-header-title-row">
            <div className="sp-header-leaf-icon">
              🌿
            </div>
            <h1 className="sp-page-heading">
              YOUR SAVED COTTON PLANTS & RECOMMENDATIONS
            </h1>
          </div>
          <p className="sp-page-subtext">
            Complete plant-wise recommendations based on each saved plant disease. Check off all steps to earn your <span className="sp-badge-highlight">🌿 Care Master Badge!</span>
          </p>
        </div>

        {/* 2. Responsive Auto-Fill Grid Layout */}
        <div className="sp-card-grid">
          {activeCards.map((prediction, pIdx) => {
            const steps = getPointWiseSteps(prediction);
            const plantChecked = checkedMap[pIdx] || (prediction.badgeEarned ? steps.map(() => true) : steps.map(() => false));
            const completedCount = plantChecked.filter(Boolean).length;
            const progressPercent = Math.round((completedCount / steps.length) * 100);
            const isFullyCompleted = progressPercent === 100 || prediction.badgeEarned;

            // Format timestamp
            let displayDate = "24/06/2025";
            if (prediction.timestamp) {
              if (typeof prediction.timestamp === 'string' && (prediction.timestamp.includes('/') || prediction.timestamp.includes('-'))) {
                displayDate = prediction.timestamp.split('T')[0];
              } else {
                displayDate = new Date(prediction.timestamp).toLocaleDateString();
              }
            }

            return (
              <div key={prediction._id || pIdx} className="sp-plant-card">
                {/* 3. Top Row (Disease Info & Scanned Image Thumbnail) */}
                <div className="sp-card-top">
                  <div className="sp-card-info-left">
                    <img
                      src={getCropThumbnail(prediction)}
                      alt="Scanned Crop Leaf"
                      className="sp-crop-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div className="sp-disease-meta">
                      <span className="sp-crop-label">
                        COTTON CROP DISEASE DIAGNOSIS
                      </span>
                      <h2 className="sp-disease-title">
                        {prediction.className}
                      </h2>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isFullyCompleted ? (
                    <span className="sp-status-badge completed">
                      <FiCheck style={{ fontSize: 13, strokeWidth: 3 }} /> Completed & Locked
                    </span>
                  ) : (
                    <span className="sp-status-badge pending">
                      <span className="sp-status-dot" />
                      {completedCount > 0 ? `${completedCount}/${steps.length} Done` : `0${steps.length} Done`}
                    </span>
                  )}
                </div>

                {/* Chemical Remedy Box If Present */}
                {prediction.chemicalRecommendation && (
                  <div className="sp-remedy-box">
                    <div className="sp-remedy-hdr">
                      <span>💊</span> Chemical Spray Remedy:
                    </div>
                    <div className="sp-remedy-txt">
                      {prediction.chemicalRecommendation}
                    </div>
                  </div>
                )}

                {/* 4. Checklist Section */}
                <div className="sp-checklist-container">
                  <div className="sp-checklist-hdr">
                    <div className="sp-checklist-hdr-left">
                      <FiList style={{ color: '#059669', fontSize: 14 }} />
                      <span>Point-Wise Recommendation Checklist</span>
                    </div>
                    <FiChevronRight className="sp-chevron" />
                  </div>

                  <div className="sp-checklist-list">
                    {steps.map((stepText, sIdx) => {
                      const isChecked = plantChecked[sIdx] || false;
                      return (
                        <div
                          key={sIdx}
                          onClick={() => handleStepToggle(pIdx, sIdx)}
                          className={`sp-checklist-row ${isChecked ? 'checked' : ''} ${isFullyCompleted ? 'locked' : ''}`}
                        >
                          <div className="sp-chk-content">
                            <div className={`sp-chk-box ${isChecked ? 'checked' : 'unchecked'}`}>
                              {isChecked && <FiCheck style={{ fontSize: 10, strokeWidth: 3 }} />}
                            </div>
                            <span className={`sp-chk-text ${isChecked ? 'checked' : ''}`}>
                              {stepText}
                            </span>
                          </div>
                          <FiChevronRight className="sp-chevron" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Progress Bar Section */}
                <div className="sp-progress-section">
                  <div className="sp-progress-meta">
                    <span>CHECKLIST COMPLETION</span>
                    <span className="sp-progress-val">{progressPercent}%</span>
                  </div>
                  <div className="sp-progress-track">
                    <div
                      className="sp-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 6. Badge Section */}
                {isFullyCompleted ? (
                  <div className="sp-badge-banner earned">
                    <div className="sp-trophy-icon">
                      🏆
                    </div>
                    <span>{prediction.className} Care Master Badge Earned!</span>
                  </div>
                ) : (
                  <div className="sp-badge-banner locked">
                    <FiLock className="sp-lock-icon" />
                    <span>Complete all steps to earn {prediction.className} Care Master Badge</span>
                  </div>
                )}

                {/* 7. Card Footer */}
                <div className="sp-card-footer">
                  <span className="sp-date-text">
                    Saved: {displayDate}
                  </span>
                  <button
                    onClick={() =>
                      notify.info(
                        'Checklist Progress',
                        `Completed ${completedCount}/${steps.length} checklist steps for ${prediction.className}`
                      )
                    }
                    className="sp-btn-routine"
                  >
                    <FiEye style={{ fontSize: 13 }} /> View Routine
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SavedPlants;