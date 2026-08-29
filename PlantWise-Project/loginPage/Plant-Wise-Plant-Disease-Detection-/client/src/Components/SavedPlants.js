import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSun, FiMoon, FiCheckCircle, FiX, FiAward, FiDroplet, FiScissors } from "react-icons/fi";
import { GiPlantWatering, GiSpray, GiPlantSeed } from "react-icons/gi";
import { MdOutlinePestControl, MdOutlineWaterDrop } from "react-icons/md";
import styled, { keyframes } from "styled-components";

// Modern color palette inspired by nature
const colors = {
  primary: "#4CAF50",
  primaryLight: "#81C784",
  primaryDark: "#388E3C",
  secondary: "#FFA000",
  background: "#F5F5F5",
  cardBg: "#FFFFFF",
  text: "#333333",
  textLight: "#757575",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FFA000",
  error: "#F44336",
  info: "#2196F3",
};

// Styled components for modern UI
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
  font-weight: 600;
  background: linear-gradient(to right, ${colors.primary}, ${colors.primaryDark});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${colors.textLight};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const PlantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const PlantCard = styled.div`
  background: ${colors.cardBg};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid ${colors.border};
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const PlantImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
`;

const PlantImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${PlantCard}:hover & {
    transform: scale(1.05);
  }
`;

const PlantDetails = styled.div`
  padding: 1.5rem;
`;

const PlantName = styled.h3`
  font-size: 1.3rem;
  color: ${colors.text};
  margin-bottom: 0.75rem;
  font-weight: 600;
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
  font-size: 0.9rem;
  color: ${colors.textLight};
  display: flex;
  justify-content: space-between;
`;

const StatusDisplay = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const StatusIcon = styled.span`
  margin-right: 0.5rem;
  color: ${props => props.color || colors.textLight};
  display: flex;
  align-items: center;
`;

const BadgePreview = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MiniBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${colors.primaryLight};
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MoreBadges = styled.span`
  font-size: 0.8rem;
  color: ${colors.textLight};
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
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${colors.border};
  position: relative;
  background: linear-gradient(to right, ${colors.primary}, ${colors.primaryLight});
  color: white;
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BadgeEarnedTag = styled.div`
  display: inline-flex;
  align-items: center;
  background: white;
  color: ${colors.primary};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RoutineToggleContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.primaryLight};
  padding: 0;
`;

const ToggleButton = styled.button`
  flex: 1;
  background: ${props => props.active ? colors.primary : 'transparent'};
  border: none;
  padding: 1rem;
  font-weight: 500;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
  gap: 0.5rem;
  font-size: 0.95rem;
  
  &:hover {
    background: ${props => props.active ? colors.primary : colors.primaryLight};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.active ? 'white' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const RoutineStepsContainer = styled.div`
  padding: 1.5rem;
`;

const StepsHeader = styled.h4`
  margin: 0 0 1.5rem;
  color: ${colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
`;

const StepsCount = styled.span`
  font-size: 0.9rem;
  font-weight: normal;
  color: ${colors.textLight};
`;

const StepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StepItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StepCheckbox = styled.input`
  margin-right: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  accent-color: ${colors.primary};
  cursor: pointer;
  flex-shrink: 0;
`;

const StepText = styled.span`
  flex: 1;
  color: ${props => props.completed ? colors.textLight : colors.text};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  font-size: 0.95rem;
`;

const StepIcon = styled.span`
  margin-right: 0.75rem;
  color: ${colors.primary};
  display: flex;
  align-items: center;
`;

const NoRoutineMessage = styled.div`
  color: ${colors.textLight};
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
  font-size: 0.95rem;
`;

const ModalBadgesSection = styled.div`
  padding: 1.5rem;
  background: ${colors.background};
  border-top: 1px solid ${colors.border};
`;

const BadgesTitle = styled.h4`
  margin: 0 0 1.5rem;
  color: ${colors.text};
  font-size: 1.1rem;
`;

const BadgesList = styled.div`
  display: grid;
  gap: 1rem;
`;

const BadgeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const BadgeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${colors.primaryLight};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  font-size: 1.2rem;
`;

const BadgeDetails = styled.div`
  flex: 1;
`;

const BadgeName = styled.div`
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 0.25rem;
`;

const BadgeDate = styled.div`
  font-size: 0.8rem;
  color: ${colors.textLight};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
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
  border: 4px solid rgba(76, 175, 80, 0.2);
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

const getStepIcon = (step) => {
  const lowerStep = step.toLowerCase();
  if (lowerStep.includes('water') || lowerStep.includes('hydration')) {
    return <GiPlantWatering />;
  } else if (lowerStep.includes('prune') || lowerStep.includes('trim')) {
    return <FiScissors />;
  } else if (lowerStep.includes('spray') || lowerStep.includes('mist')) {
    return <GiSpray />;
  } else if (lowerStep.includes('pest') || lowerStep.includes('insect')) {
    return <MdOutlinePestControl />;
  } else if (lowerStep.includes('fertilize') || lowerStep.includes('nutrient')) {
    return <GiPlantSeed />;
  }
  return <FiCheckCircle />;
};

const SavedPlants = () => {
  const [predictions, setPredictions] = useState([]);
  const [selectedCareRoutine, setSelectedCareRoutine] = useState(null);
  const [routineType, setRoutineType] = useState("morning");
  const [checkedSteps, setCheckedSteps] = useState({ morning: [], night: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [plantBadges, setPlantBadges] = useState({});

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch predictions
      const predictionsRes = await axios.get("http://localhost:6005/api/predictions", {
        withCredentials: true,
      });
      setPredictions(predictionsRes.data);
      
      // Fetch all badges
      const badgesRes = await axios.get("http://localhost:6005/api/user/badges", {
        withCredentials: true,
      });
      
      // Organize badges by plant class name
      const organizedBadges = {};
      badgesRes.data.badges.forEach(badge => {
        if (badge.plantClassName) {
          if (!organizedBadges[badge.plantClassName]) {
            organizedBadges[badge.plantClassName] = [];
          }
          organizedBadges[badge.plantClassName].push(badge);
        }
      });
      
      setPlantBadges(organizedBadges);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const openModal = (prediction) => {
    setSelectedCareRoutine(prediction);
    setRoutineType("morning");
    
    // Initialize checkbox states for both routines based on current completion status
    setCheckedSteps({
      morning: prediction.morningCareRoutine?.map(() => prediction.completedMorning) || [],
      night: prediction.nightCareRoutine?.map(() => prediction.completedNight) || []
    });
  };

  const closeModal = () => {
    setSelectedCareRoutine(null);
  };

  const toggleRoutine = () => {
    setRoutineType(prev => prev === "morning" ? "night" : "morning");
  };

  const handleCheckboxChange = async (index) => {
    // Update the checked state for the current routine
    const updatedSteps = {
      ...checkedSteps,
      [routineType]: checkedSteps[routineType].map((val, i) => 
        i === index ? !val : val
      )
    };
    
    setCheckedSteps(updatedSteps);

    // Check if all steps in current routine are completed
    const allChecked = updatedSteps[routineType].every(val => val);
    
    if (allChecked && selectedCareRoutine) {
      try {
        const response = await axios.post(
          "http://localhost:6005/api/user/mark-care",
          {
            className: selectedCareRoutine.className,
            routineType,
          },
          { withCredentials: true }
        );

        if (response.data.badgeAwarded) {
          alert(`🎉 New badge earned: ${response.data.badgeAwarded.name}`);
          setPlantBadges(prev => ({
            ...prev,
            [selectedCareRoutine.className]: [
              ...(prev[selectedCareRoutine.className] || []),
              response.data.badgeAwarded
            ]
          }));
        }

        // Update local state to reflect completion
        const updatedPredictions = predictions.map(p => 
          p._id === selectedCareRoutine._id 
            ? { 
                ...p, 
                [`completed${routineType.charAt(0).toUpperCase() + routineType.slice(1)}`]: true,
                badgeEarned: response.data.badgeEarned || p.badgeEarned
              } 
            : p
        );
        setPredictions(updatedPredictions);
        
        // Update selected care routine in modal
        setSelectedCareRoutine(prev => ({
          ...prev,
          [`completed${routineType.charAt(0).toUpperCase() + routineType.slice(1)}`]: true,
          badgeEarned: response.data.badgeEarned || prev.badgeEarned
        }));

        // Update checkbox states to reflect completion
        setCheckedSteps({
          ...updatedSteps,
          [routineType]: updatedSteps[routineType].map(() => true)
        });

      } catch (err) {
        console.error("Error marking routine complete:", err);
        // Revert checkbox state on error
        setCheckedSteps({
          ...checkedSteps,
          [routineType]: checkedSteps[routineType].map((val, i) => 
            i === index ? !val : val
          )
        });
      }
    }
  };

  const getProgressStatus = (prediction) => {
    if (prediction.badgeEarned) {
      return {
        text: "Complete",
        progress: 100,
        color: colors.success,
        icon: <FiCheckCircle />
      };
    }
    if (prediction.completedMorning && prediction.completedNight) {
      return {
        text: "Ready for Badge",
        progress: 100,
        color: colors.warning,
        icon: <FiAward />
      };
    }
    if (prediction.completedMorning || prediction.completedNight) {
      return {
        text: "In Progress",
        progress: 50,
        color: colors.info,
        icon: <FiCheckCircle />
      };
    }
    return {
      text: "Not Started",
      progress: 0,
      color: colors.textLight,
      icon: <FiCheckCircle />
    };
  };

  const getPlantImage = (className) => {
    // Placeholder images - replace with your actual image paths
    const plantImages = {
      "Tomato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "Rose": "https://images.unsplash.com/photo-1519683109079-d5f539e1542f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      "Potato___Early_blight": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    };
    return plantImages[className] || "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading your plants...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Your Plant Collection</Title>
        <Subtitle>
          Track and manage your plant care routines. Complete daily tasks to earn badges and keep your plants thriving.
        </Subtitle>
      </Header>

      {predictions.length > 0 ? (
        <PlantsGrid>
          {predictions.map((prediction, index) => {
            const status = getProgressStatus(prediction);
            const badges = plantBadges[prediction.className] || [];

            return (
              <PlantCard key={index}>
                <PlantImageContainer>
                  <PlantImage 
                    src={getPlantImage(prediction.className)} 
                    alt={prediction.className}
                  />
                </PlantImageContainer>

                <PlantDetails>
                  <PlantName>{prediction.className}</PlantName>
                  
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill 
                        style={{ width: `${status.progress}%` }} 
                        color={status.color}
                      />
                    </ProgressBar>
                    <ProgressText>
                      <span>Care Progress</span>
                      <span>{status.progress}%</span>
                    </ProgressText>
                  </ProgressContainer>

                  <StatusDisplay>
                    <StatusIcon color={status.color}>
                      {status.icon}
                    </StatusIcon>
                    <span>{status.text}</span>
                  </StatusDisplay>

                  <BadgePreview>
                    {badges.slice(0, 3).map((badge, i) => (
                      <MiniBadge key={i} title={badge.name}>
                        <FiAward />
                      </MiniBadge>
                    ))}
                    {badges.length > 3 && (
                      <MoreBadges>+{badges.length - 3} more</MoreBadges>
                    )}
                  </BadgePreview>

                  <CardFooter>
                    <DateAdded>
                      Added: {new Date(prediction.timestamp).toLocaleDateString()}
                    </DateAdded>
                    <ViewRoutineButton onClick={() => openModal(prediction)}>
                      View Care
                    </ViewRoutineButton>
                  </CardFooter>
                </PlantDetails>
              </PlantCard>
            );
          })}
        </PlantsGrid>
      ) : (
        <EmptyState>
          <EmptyImage src="/images/no-plants.svg" alt="No plants found" />
          <EmptyTitle>No plants saved yet</EmptyTitle>
          <EmptyText>
            Detect plant diseases to start tracking care routines and earn badges for your plant care achievements.
          </EmptyText>
        </EmptyState>
      )}

      {selectedCareRoutine && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeModal}>
              <FiX />
            </CloseButton>

            <ModalHeader>
              <ModalTitle>
                {selectedCareRoutine.className} Care Routine
              </ModalTitle>
              {selectedCareRoutine.badgeEarned && (
                <BadgeEarnedTag>
                  <FiAward /> Care Mastered
                </BadgeEarnedTag>
              )}
            </ModalHeader>

            <RoutineToggleContainer>
              <ToggleButton
                active={routineType === 'morning'}
                onClick={() => setRoutineType('morning')}
              >
                <FiSun /> Morning Routine
                {selectedCareRoutine.completedMorning && (
                  <FiCheckCircle />
                )}
              </ToggleButton>
              <ToggleButton
                active={routineType === 'night'}
                onClick={() => setRoutineType('night')}
              >
                <FiMoon /> Night Routine
                {selectedCareRoutine.completedNight && (
                  <FiCheckCircle />
                )}
              </ToggleButton>
            </RoutineToggleContainer>

            <RoutineStepsContainer>
              <StepsHeader>
                {routineType === 'morning' ? 'Morning' : 'Night'} Care Steps
                {selectedCareRoutine[`${routineType}CareRoutine`]?.length > 0 && (
                  <StepsCount>
                    {checkedSteps[routineType].filter(Boolean).length}/{selectedCareRoutine[`${routineType}CareRoutine`].length} completed
                  </StepsCount>
                )}
              </StepsHeader>

              {(selectedCareRoutine[`${routineType}CareRoutine`] || []).length > 0 ? (
                <StepsList>
                  {selectedCareRoutine[`${routineType}CareRoutine`].map((step, idx) => (
                    <StepItem key={idx}>
                      <StepCheckbox
                        type="checkbox"
                        checked={checkedSteps[routineType][idx] || false}
                        disabled={
                          (routineType === "morning" && selectedCareRoutine.completedMorning) ||
                          (routineType === "night" && selectedCareRoutine.completedNight)
                        }
                        onChange={() => handleCheckboxChange(idx)}
                      />
                      <StepIcon>
                        {getStepIcon(step)}
                      </StepIcon>
                      <StepText completed={checkedSteps[routineType][idx]}>
                        {step}
                      </StepText>
                    </StepItem>
                  ))}
                </StepsList>
              ) : (
                <NoRoutineMessage>
                  No {routineType} care routine available for this plant.
                </NoRoutineMessage>
              )}
            </RoutineStepsContainer>

            {plantBadges[selectedCareRoutine.className]?.length > 0 && (
              <ModalBadgesSection>
                <BadgesTitle>Earned Badges</BadgesTitle>
                <BadgesList>
                  {plantBadges[selectedCareRoutine.className].map((badge, index) => (
                    <BadgeItem key={index}>
                      <BadgeIcon>
                        <FiAward />
                      </BadgeIcon>
                      <BadgeDetails>
                        <BadgeName>{badge.name}</BadgeName>
                        <BadgeDate>
                          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                        </BadgeDate>
                      </BadgeDetails>
                    </BadgeItem>
                  ))}
                </BadgesList>
              </ModalBadgesSection>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SavedPlants;