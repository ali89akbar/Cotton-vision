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

import axios from "axios";

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
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: '7.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'linear-gradient(180deg, #f0fdf4 0%, #e2e8f0 100%)' }}>
        <Card style={{ padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: 500, background: '#ffffff', margin: '0 1rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 64, height: 64, borderRadius: '50%', background: '#e6f4ea', color: '#059669', fontSize: 32, marginBottom: 16 }}>
            🏅
          </div>
          <Typography variant="h5" style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            🔒 Registered Farmer Access Only
          </Typography>
          <Typography variant="body1" style={{ marginTop: 10, color: '#475569', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            Please log in with your account to track your plant care achievements, view unlocked badges, and share progress.
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 30px', fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => window.location.href = '/login'}
          >
            🔑 LOGIN TO ACCESS BADGES
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Container style={{ paddingTop: "7.5rem", paddingBottom: "3rem" }}>
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
