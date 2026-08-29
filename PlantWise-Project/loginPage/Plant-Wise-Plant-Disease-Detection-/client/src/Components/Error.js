import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  useTheme,
  useMediaQuery 
} from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f5e8 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 500,
    width: '100%',
    textAlign: 'center',
    borderRadius: 16,
    border: '1px solid #e0e0e0',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 8,
      background: 'linear-gradient(90deg, #3A7D44 0%, #6BBF59 50%, #38A3A5 100%)'
    }
  },
  icon: {
    fontSize: 80,
    color: '#3A7D44',
    marginBottom: theme.spacing(2),
    background: '#e8f5e9',
    borderRadius: '50%',
    padding: theme.spacing(2),
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
  },
  title: {
    fontWeight: 700,
    color: '#2E7D32',
    marginBottom: theme.spacing(2)
  },
  text: {
    color: '#455a64',
    marginBottom: theme.spacing(3)
  },
  button: {
    margin: theme.spacing(1),
    padding: '10px 24px',
    fontWeight: 600,
    borderRadius: 12,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&.primary': {
      background: 'linear-gradient(45deg, #3A7D44 0%, #6BBF59 100%)',
      color: 'white',
      '&:hover': {
        boxShadow: '0 4px 12px 0 rgba(58, 125, 68, 0.4)',
        transform: 'translateY(-2px)'
      }
    },
    '&.secondary': {
      borderColor: '#38A3A5',
      color: '#38A3A5',
      '&:hover': {
        backgroundColor: 'rgba(56, 163, 165, 0.08)'
      }
    }
  },
  leafDecoration: {
    position: 'absolute',
    opacity: 0.1,
    zIndex: 0,
    '&.top-right': {
      top: -50,
      right: -50,
      transform: 'rotate(45deg)'
    },
    '&.bottom-left': {
      bottom: -50,
      left: -50,
      transform: 'rotate(-45deg)'
    }
  }
}));

const Error = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Simple leaf SVG component
  const LeafIcon = ({ className }) => (
    <svg 
      width="200" 
      height="200" 
      viewBox="0 0 24 24" 
      fill="#3A7D44" 
      className={className}
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17 1.03.3 1.58.4L8 21.7l1.03-2.64c.55.1 1.17.18 1.75.26L12 21l1.22-2.68c.6-.08 1.22-.15 1.79-.26l1.03 2.64 1.77-2.2c.55-.1 1.1-.23 1.58-.4l.95 2.3 1.89-.66C18.14 16.17 16 10 17 8M12 2S7 4 7 12c0 0 .14 1.59 2 3.28 1.86-1.69 2-3.28 2-3.28C11 4 12 2 12 2z"/>
    </svg>
  );

  return (
    <Box className={classes.root}>
      <LeafIcon className={`${classes.leafDecoration} top-right`} />
      <LeafIcon className={`${classes.leafDecoration} bottom-left`} />
      
      <Paper className={classes.paper} elevation={0}>
        <ErrorOutlineIcon className={classes.icon} />
        
        <Typography variant="h4" className={classes.title}>
          Plant Care Login Issue
        </Typography>
        
        <Typography variant="body1" className={classes.text}>
          We couldn't log you into your plant care dashboard. This might be because:
        </Typography>
        
        <Box 
          component="ul" 
          textAlign="left" 
          mb={3} 
          pl={isMobile ? 2 : 4}
          style={{ color: '#455a64' }}
        >
          <Typography component="li" variant="body2" gutterBottom>
            Incorrect email or password
          </Typography>
          <Typography component="li" variant="body2" gutterBottom>
            Your session may have expired
          </Typography>
          <Typography component="li" variant="body2">
            Our plant database might be undergoing maintenance
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph style={{ color: '#38A3A5', fontStyle: 'italic' }}>
          Need help with your plants? Contact our garden support team.
        </Typography>
        
        <Box mt={4}>
          <Button 
            variant="contained" 
            className={`${classes.button} primary`}
            onClick={() => navigate("/login")}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            className={`${classes.button} secondary`}
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Error;