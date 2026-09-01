import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  TextField,
  Box,
  useTheme,
  useMediaQuery
} from '@material-ui/core';
import {
  Favorite,
  FavoriteBorder,
  Delete,
  AddAPhoto,
  Share,
  LocalFlorist,
  Nature
} from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:6005';

const loadFacebookSDK = () => {
  if (window.FB) return Promise.resolve();

  return new Promise((resolve) => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '676657871641439',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v12.0'
      });
      resolve();
    };
    (function (d, s, id) {
      if (d.getElementById(id)) return;
      const js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      const fjs = d.getElementsByTagName(s)[0];
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '7.5rem 1.5rem 3rem 1.5rem',
    background: 'linear-gradient(to bottom, #f5f7fa 0%, #e4f5e8 100%)',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4)
  },
  title: {
    fontWeight: 800,
    color: '#2E7D32',
    marginLeft: theme.spacing(2),
    flexGrow: 1
  },
  postCard: {
    marginBottom: theme.spacing(4),
    borderRadius: 16,
    border: '1px solid rgba(58, 125, 68, 0.1)',
    boxShadow: '0 8px 24px 0 rgba(58, 125, 68, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 28px 0 rgba(58, 125, 68, 0.15)'
    }
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: '1px solid rgba(58, 125, 68, 0.1)'
  },
  postImage: {
    borderRadius: 12,
    marginBottom: theme.spacing(2),
    maxHeight: 500,
    width: '100%',
    objectFit: 'cover',
    border: '1px solid rgba(58, 125, 68, 0.1)'
  },
  postActions: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    borderTop: '1px solid rgba(58, 125, 68, 0.1)'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  },
  createButton: {
    background: 'linear-gradient(45deg, #3A7D44 0%, #6BBF59 100%)',
    color: 'white',
    fontWeight: 600,
    borderRadius: 12,
    padding: '10px 24px',
    boxShadow: '0 4px 12px 0 rgba(58, 125, 68, 0.2)',
    marginBottom: theme.spacing(4),
    '&:hover': {
      boxShadow: '0 6px 16px 0 rgba(58, 125, 68, 0.3)'
    }
  },
  likeButton: {
    color: '#e91e63'
  },
  shareButton: {
    color: '#38A3A5'
  },
  deleteButton: {
    color: '#f44336'
  },
  dialogPaper: {
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)'
  },
  dialogTitle: {
    background: 'linear-gradient(45deg, #3A7D44 0%, #6BBF59 100%)',
    color: 'white',
    borderRadius: '16px 16px 0 0',
    padding: theme.spacing(2)
  },
  plantIcon: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    color: '#3A7D44'
  }
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SocialMedia = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [posts, setPosts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect(() => {
  //   loadFacebookSDK();
  //   const checkAuthAndFetchData = async () => {
  //     try {
  //       setAuthLoading(true);
  //       const authResponse = await axios.get('/login/sucess');
  //       if (authResponse.data.user) {
  //         setUser(authResponse.data.user);
  //         const postsResponse = await axios.get('/api/posts');
  //         setPosts(postsResponse.data);
  //       } else {
  //         navigate('/login');
  //       }
  //     } catch {
  //       navigate('/login');
  //     } finally {
  //       setAuthLoading(false);
  //     }
  //   };
  //   checkAuthAndFetchData();
  // }, [navigate]);

  useEffect(() => {
    const initialize = async () => {
      try {
        loadFacebookSDK().catch((err) => console.warn("FB SDK optional load skipped:", err));
      } catch (e) {}
      await checkAuthAndFetchData();
    };
    initialize();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      setAuthLoading(true);
      const authResponse = await axios.get('/login/sucess');
      if (authResponse.data.user) {
        setUser(authResponse.data.user);
        try {
          const postsResponse = await axios.get('/api/posts');
          setPosts(postsResponse.data);
        } catch {
          console.warn("Could not fetch posts");
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => post._id === postId ? response.data : post));
    } catch {
      setError('Failed to update like');
    }
  };

  const handleCreatePost = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/posts', { imageUrl, description });
      setPosts([response.data, ...posts]);
      setSuccess('Post created successfully');
      setOpenDialog(false);
      setImageUrl('');
      setDescription('');
    } catch {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      setSuccess('Post deleted successfully');
    } catch {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  // const handleShareOnFacebook = (post) => {
  //   if (!window.FB) {
  //     setError('Facebook SDK not loaded');
  //     return;
  //   }
  //   window.FB.ui({
  //     method: 'share',
  //     href: `http://localhost:3000/post/${post._id}`,
  //     quote: post.description,
  //   }, function (response) { });
  // };

  const handleShareOnFacebook = async (post) => {
    try {
      if (!window.FB) {
        await loadFacebookSDK();
      }

      // Ensure we have a valid post URL (replace with your actual domain)
      const postUrl = `https://your-ngrok-url.ngrok.io/post/${post._id}`;
      
      // First, update the meta tags for this specific post
      updateMetaTags({
        title: `${post.user?.displayName}'s Plant Update`,
        description: post.description,
        image: post.imageUrl,
        url: postUrl
      });

      // Then trigger the share dialog
      window.FB.ui({
        method: 'share',
        href: postUrl,
        quote: `${post.description}\n\nShared from Plant Care Community`,
        hashtag: '#PlantCare',
      }, (response) => {
        if (response && !response.error_message) {
          setSuccess('Post shared on Facebook successfully!');
        } else {
          setError(response?.error_message || 'Failed to share on Facebook');
        }
      });
    } catch (err) {
      setError('Error sharing to Facebook: ' + err.message);
    }
  };
  const updateMetaTags = ({ title, description, image, url }) => {
    // This function dynamically updates meta tags for sharing
    const metaTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { property: 'fb:app_id', content: '676657871641439' },
    ];

    // Remove existing OG tags
    document.querySelectorAll('meta[property^="og:"]').forEach(el => el.remove());
    
    // Add new ones
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  };
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  if (authLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress style={{ color: '#3A7D44' }} />
      </Box>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className={classes.root} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card style={{ padding: 40, textAlign: 'center', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxWidth: 500, background: '#ffffff' }}>
          <LocalFlorist style={{ fontSize: 54, color: '#059669', marginBottom: 12 }} />
          <Typography variant="h5" style={{ fontWeight: 800, color: '#064e3b', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            🔒 Registered Farmer Access Only
          </Typography>
          <Typography variant="body1" style={{ marginTop: 10, color: '#475569', lineHeight: 1.6 }}>
            Please log in with your account to access the Farmer Community, view field updates, and share disease reports directly to Facebook.
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', fontWeight: 700, borderRadius: 30, padding: '12px 30px' }}
            onClick={() => navigate('/login')}
          >
            🔑 Login to Access Community & FB Share
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={classes.root}>

      <Helmet>
        <meta property="og:site_name" content="Plant Care Community" />
        <meta property="og:type" content="website" />
        <meta property="fb:app_id" content="676657871641439" />
      </Helmet>
      <Box className={classes.header}>
        <LocalFlorist fontSize="large" style={{ color: '#3A7D44' }} />
        <Typography variant="h4" className={classes.title}>
          Plant Care Community
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddAPhoto />}
        onClick={() => setOpenDialog(true)}
        className={classes.createButton}
      >
        Share Plant Progress
      </Button>

      {loading && posts.length === 0 ? (
        <div className={classes.loadingContainer}>
          <CircularProgress style={{ color: '#3A7D44' }} />
        </div>
      ) : (
        posts.map(post => (
          <Card key={post._id} className={classes.postCard}>
            <CardContent>
              <div className={classes.postHeader}>
                <Avatar
                  src={post.user?.image}
                  alt={post.user?.displayName}
                  style={{ 
                    width: 48, 
                    height: 48, 
                    marginRight: 16,
                    border: '2px solid #6BBF59'
                  }}
                />
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#3A7D44' }}>
                    {post.user?.displayName}
                  </Typography>
                  <Typography variant="caption" style={{ color: '#38A3A5' }}>
                    Plant Enthusiast
                  </Typography>
                </Box>
                {user && user._id === post.user?._id && (
                  <IconButton
                    onClick={() => handleDeletePost(post._id)}
                    className={classes.deleteButton}
                    disabled={loading}
                  >
                    <Delete />
                  </IconButton>
                )}
              </div>

              {post.imageUrl && (
                <CardMedia
                  component="img"
                  image={post.imageUrl}
                  alt="Plant image"
                  className={classes.postImage}
                />
              )}

              <Typography variant="body1" paragraph style={{ color: '#455a64' }}>
                <Nature className={classes.plantIcon} fontSize="small" />
                {post.description}
              </Typography>

              <div className={classes.postActions}>
                <IconButton 
                  onClick={() => handleLike(post._id)} 
                  disabled={!user}
                  className={classes.likeButton}
                >
                  {post.likes.includes(user?._id) ? (
                    <Favorite />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <Typography style={{ marginRight: 16, color: '#3A7D44' }}>
                  {post.likes.length} plant lovers
                </Typography>

                <IconButton 
                  onClick={() => handleShareOnFacebook(post)}
                  className={classes.shareButton}
                >
                  <Share />
                </IconButton>

                <Typography variant="caption" style={{ marginLeft: 'auto', color: '#38A3A5' }}>
                  {new Date(post.createdAt).toLocaleString()}
                </Typography>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ className: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Share Your Plant Progress
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              margin="dense"
              label="Plant Photo URL"
              type="url"
              fullWidth
              variant="outlined"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ marginBottom: 16 }}
              InputProps={{
                startAdornment: (
                  <AddAPhoto color="action" style={{ marginRight: 8 }} />
                )
              }}
            />
            <TextField
              margin="dense"
              label="Plant Care Notes"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LocalFlorist fontSize="small" color="action" style={{ marginRight: 8 }} />
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: theme.spacing(2) }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            style={{ color: '#38A3A5' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePost}
            disabled={!imageUrl || loading}
            variant="contained"
            style={{
              background: 'linear-gradient(45deg, #3A7D44 0%, #6BBF59 100%)',
              color: 'white'
            }}
          >
            {loading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Share Plant Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          style={{ 
            width: '100%',
            borderRadius: 12,
            backgroundColor: error ? '#f44336' : '#4caf50'
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SocialMedia;