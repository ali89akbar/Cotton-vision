import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton
} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { Facebook } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  plantCard: {
    marginBottom: theme.spacing(3),
    borderRadius: 20,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9fdf9",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)"
    },
    position: 'relative',
    padding: theme.spacing(1),
  },
  progressBar: {
    height: 14,
    borderRadius: 10,
    margin: "10px 0",
    backgroundColor: "#e0f2e9",
    "& .MuiLinearProgress-barColorPrimary": {
      backgroundColor: "#4caf50"
    }
  },
  badgeChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: "#c8e6c9",
    color: "#1b5e20",
    fontWeight: 600,
  },
  shareButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: "#6BBF59",
    color: "white",
    "&:hover": {
      backgroundColor: "#2d4373",
    }
  },
  facebookButton: {
    backgroundColor: '#6BBF59',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2d4373',
    },
    marginTop: theme.spacing(2),
    textTransform: "none",
    fontWeight: 500,
    borderRadius: 10,
  },
  chipWrapper: {
    marginTop: theme.spacing(1),
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    color: "#388e3c",
    fontWeight: 600
  },
  mainTitle: {
    color: "#2e7d32",
    fontWeight: 700,
    marginBottom: theme.spacing(4),
  }
}));

const BadgeProgressPage = () => {
  const classes = useStyles();
  const [plantProgress, setPlantProgress] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '676657871641439',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v12.0'
      });
    };

    (function (d, s, id) {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    const fetchData = async () => {
      try {
        const progressResponse = await fetch("http://localhost:6005/api/user/plant-progress", {
          credentials: "include",
        });
        const badgesResponse = await fetch("http://localhost:6005/api/user/badges", {
          credentials: "include",
        });

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setPlantProgress(progressData);
        }

        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          setBadges(badgesData.badges || []);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const calculateProgress = (plant) => {
    let completed = 0;
    if (plant.progress.morning) completed += 50;
    if (plant.progress.night) completed += 50;
    return completed;
  };

  const shareOnFacebook = (plant) => {
    if (window.FB) {
      const progress = calculateProgress(plant);
      const shareText = `I've completed ${progress}% of my ${plant.className} plant care routine! 🌱`;

      try {
        window.FB.ui({
          method: 'share',
          href: window.location.href,
          quote: shareText,
          hashtag: '#PlantCare',
        }, function (response) {
          if (response?.error_message) {
            console.error("Facebook share error:", response.error_message);
          } else {
            console.log("Shared successfully!");
          }
        });
      } catch (error) {
        console.error("Facebook share error:", error.message);
      }
    } else {
      console.error("Facebook SDK not loaded.");
    }
  };

  return (
    <Container style={{ marginTop: "50px" }}>
      <Typography variant="h4" className={classes.mainTitle}>
        🌿 Your Plant Care Progress
      </Typography>

      <Typography variant="h6" className={classes.sectionTitle}>
        Your Badges
      </Typography>
      <div style={{ marginBottom: 30 }}>
        {badges.length > 0 ? (
          badges.map((badge, index) => (
            <Chip
              key={index}
              label={`${badge.name}${badge.plantClassName ? ` (${badge.plantClassName})` : ''}`}
              className={classes.badgeChip}
            />
          ))
        ) : (
          <Typography variant="body1">No badges earned yet</Typography>
        )}
      </div>

      <Typography variant="h6" className={classes.sectionTitle}>
        Individual Plant Progress
      </Typography>

      <Grid container spacing={3}>
        {plantProgress.map((plant, index) => {
          const progress = calculateProgress(plant);

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className={classes.plantCard}>
                <IconButton
                  className={classes.shareButton}
                  onClick={() => shareOnFacebook(plant)}
                  aria-label="share on facebook"
                >
                  <Facebook />
                </IconButton>

                <CardContent>
                  <Typography variant="h6" gutterBottom>{plant.className}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Added: {new Date(plant.timestamp).toLocaleDateString()}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    className={classes.progressBar}
                  />

                  <Typography variant="body2">
                    Progress: {progress}%
                  </Typography>

                  <div className={classes.chipWrapper}>
                    <Chip
                      label="Morning Routine"
                      color={plant.progress.morning ? "primary" : "default"}
                      size="small"
                    />
                    <Chip
                      label="Night Routine"
                      color={plant.progress.night ? "primary" : "default"}
                      size="small"
                      style={{ marginLeft: 5 }}
                    />
                    {plant.progress.badgeEarned && (
                      <Chip
                        label="Badge Earned"
                        color="secondary"
                        size="small"
                        style={{ marginLeft: 5 }}
                      />
                    )}
                  </div>

                  <Button
                    variant="contained"
                    className={classes.facebookButton}
                    startIcon={<Facebook />}
                    fullWidth
                    onClick={() => shareOnFacebook(plant)}
                  >
                    Share Progress
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default BadgeProgressPage;
