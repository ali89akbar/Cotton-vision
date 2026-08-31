import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSun, FiMoon, FiCheckCircle, FiX, FiAward, FiBookmark, FiShield, FiCheckSquare, FiSquare } from "react-icons/fi";
import { GiPlantWatering, GiSpray, GiPlantSeed } from "react-icons/gi";
import { MdOutlinePestControl } from "react-icons/md";
import styled, { keyframes } from "styled-components";

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: ${colors.primaryDark};
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(to right, ${colors.primary}, ${colors.primaryDark});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${colors.textLight};
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.5;
`;

const PlantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const PlantCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid ${colors.border};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  }
`;

const PlantCardHeader = styled.div`
  background: linear-gradient(135deg, #064e3b 0%, #059669 100%);
  color: white;
  padding: 1.25rem;
  text-align: left;
`;

const CropLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  display: block;
`;

const DiseaseTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  margin: 4px 0;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
`;

const LocationBadge = styled.span`
  font-size: 0.82rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 4px;
`;

const PlantDetails = styled.div`
  padding: 1.5rem;
`;

const ChemicalBox = styled.div`
  background: #ffffff;
  border-left: 4px solid #059669;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  border-radius: 10px;
  padding: 0.9rem;
  margin-bottom: 1.2rem;
`;

const ChemicalTitle = styled.div`
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
`;

const ChemicalText = styled.div`
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
`;

const ChecklistSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`;

const ChecklistHeader = styled.div`
  font-weight: 700;
  color: #064e3b;
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
`;

const ChecklistList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem;
  border-radius: 8px;
  background: ${props => props.checked ? '#e6f4ea' : '#ffffff'};
  border: 1px solid ${props => props.checked ? '#a8dab5' : '#f1f5f9'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #059669;
  }
`;

const CheckIcon = styled.div`
  color: ${props => props.checked ? '#059669' : '#94a3b8'};
  font-size: 1.2rem;
  margin-top: 1px;
`;

const ItemText = styled.span`
  font-size: 0.88rem;
  color: ${props => props.checked ? '#064e3b' : '#334155'};
  text-decoration: ${props => props.checked ? 'line-through' : 'none'};
  line-height: 1.4;
`;

const ProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${props => props.color || colors.primary};
  transition: width 0.5s ease;
`;

const ProgressText = styled.span`
  font-size: 0.88rem;
  color: ${colors.textLight};
  display: flex;
  justify-content: space-between;
  font-weight: 600;
`;

const BadgeEarnedBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  color: #78350f;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${colors.border};
`;

const DateAdded = styled.span`
  font-size: 0.8rem;
  color: ${colors.textLight};
`;

const ViewRoutineButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  margin-top: 2rem;
  background: white;
  border-radius: 12px;
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

// Helper to generate 4 point-wise recommendation steps for check marks
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

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const predictionsRes = await axios.get("http://localhost:6005/api/predictions", {
        withCredentials: true,
      });
      const data = predictionsRes.data || [];
      setPredictions(data);

      // Initialize checked state map
      const initialChecked = {};
      data.forEach((p, pIdx) => {
        const steps = getPointWiseSteps(p);
        initialChecked[pIdx] = steps.map(() => p.badgeEarned || false);
      });
      setCheckedMap(initialChecked);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleStepToggle = async (plantIndex, stepIndex) => {
    const currentPlant = predictions[plantIndex];
    const steps = getPointWiseSteps(currentPlant);

    const currentPlantChecked = [...(checkedMap[plantIndex] || steps.map(() => false))];
    currentPlantChecked[stepIndex] = !currentPlantChecked[stepIndex];

    const updatedCheckedMap = {
      ...checkedMap,
      [plantIndex]: currentPlantChecked,
    };
    setCheckedMap(updatedCheckedMap);

    const allChecked = currentPlantChecked.every(Boolean);

    // If ALL check marks are checked, award badge!
    if (allChecked && !currentPlant.badgeEarned) {
      try {
        const response = await axios.post(
          "http://localhost:6005/api/user/mark-care",
          { className: currentPlant.className, routineType: "morning" },
          { withCredentials: true }
        );

        alert(`🎉 CONGRATULATIONS! You completed all point-wise recommendations for ${currentPlant.className}!\n\nNew Badge Earned: 🏆 ${currentPlant.className} Care Master Badge!`);

        // Update local state to reflect badge earned
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
        <PlantsGrid>
          {predictions.map((prediction, pIdx) => {
            const steps = getPointWiseSteps(prediction);
            const plantChecked = checkedMap[pIdx] || steps.map(() => false);
            const completedCount = plantChecked.filter(Boolean).length;
            const progressPercent = Math.round((completedCount / steps.length) * 100);

            return (
              <PlantCard key={pIdx}>
                {/* PLANT & DISEASE HEADER */}
                <PlantCardHeader>
                  <CropLabel>Cotton Crop Disease Diagnosis</CropLabel>
                  <DiseaseTitle>{prediction.className}</DiseaseTitle>
                  {prediction.region && (
                    <LocationBadge>📍 {prediction.region}</LocationBadge>
                  )}
                </PlantCardHeader>

                <PlantDetails>
                  {/* CHEMICAL FORMULATION (ENGLISH) */}
                  {prediction.chemicalRecommendation && (
                    <ChemicalBox>
                      <ChemicalTitle>💊 Chemical Spray Remedy (English Product)</ChemicalTitle>
                      <ChemicalText>{prediction.chemicalRecommendation}</ChemicalText>
                    </ChemicalBox>
                  )}

                  {/* POINT-WISE RECOMMENDATION CHECKLIST */}
                  <ChecklistSection>
                    <ChecklistHeader>
                      <span>📋 Point-Wise Recommendation Checklist</span>
                      <span style={{ fontSize: "0.82rem", color: "#059669" }}>
                        {completedCount}/{steps.length} Done
                      </span>
                    </ChecklistHeader>

                    <ChecklistList>
                      {steps.map((stepText, sIdx) => {
                        const isChecked = plantChecked[sIdx] || false;
                        return (
                          <ChecklistItem
                            key={sIdx}
                            checked={isChecked}
                            onClick={() => handleStepToggle(pIdx, sIdx)}
                          >
                            <CheckIcon checked={isChecked}>
                              {isChecked ? <FiCheckSquare /> : <FiSquare />}
                            </CheckIcon>
                            <ItemText checked={isChecked}>{stepText}</ItemText>
                          </ChecklistItem>
                        );
                      })}
                    </ChecklistList>
                  </ChecklistSection>

                  {/* PROGRESS BAR & BADGE BANNER */}
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill style={{ width: `${progressPercent}%` }} color={progressPercent === 100 ? "#059669" : "#0284c7"} />
                    </ProgressBar>
                    <ProgressText>
                      <span>Checklist Completion</span>
                      <span>{progressPercent}%</span>
                    </ProgressText>
                  </ProgressContainer>

                  {(prediction.badgeEarned || progressPercent === 100) && (
                    <BadgeEarnedBanner>
                      <FiAward style={{ fontSize: "1.2rem", color: "#d97706" }} />
                      🏆 {prediction.className} Care Master Badge Earned!
                    </BadgeEarnedBanner>
                  )}

                  <CardFooter>
                    <DateAdded>
                      Saved: {new Date(prediction.timestamp || Date.now()).toLocaleDateString()}
                    </DateAdded>
                    <ViewRoutineButton onClick={() => alert(`Showing point-wise checklist for ${prediction.className}`)}>
                      <FiCheckCircle /> View Routine
                    </ViewRoutineButton>
                  </CardFooter>
                </PlantDetails>
              </PlantCard>
            );
          })}
        </PlantsGrid>
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