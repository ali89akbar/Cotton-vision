import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import {
  FaLeaf,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShareAlt,
  FaTrashAlt,
  FaCloudUploadAlt,
  FaTimes,
  FaImage,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaSeedling,
  FaFire,
  FaCheckCircle,
  FaBug,
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:6005";

const loadFacebookSDK = () => {
  if (window.FB) return Promise.resolve();

  return new Promise((resolve) => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "676657871641439",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v12.0",
      });
      resolve();
    };
    (function (d, s, id) {
      if (d.getElementById(id)) return;
      const js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      const fjs = d.getElementsByTagName(s)[0];
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  });
};

const SocialMedia = () => {
  const [posts, setPosts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [commentOpen, setCommentOpen] = useState({});
  const [commentText, setCommentText] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        loadFacebookSDK().catch((err) => console.warn("FB SDK load skipped:", err));
      } catch (e) {}
      await checkAuthAndFetchData();
    };
    initialize();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      setAuthLoading(true);
      const authResponse = await axios.get("/login/sucess");
      if (authResponse.data.user) {
        setUser(authResponse.data.user);
        try {
          const postsResponse = await axios.get("/api/posts");
          setPosts(postsResponse.data || []);
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
      setPostsLoading(false);
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
    } catch {
      setError("Failed to update like");
    }
  };

  const handleCreatePost = async () => {
    if (!imagePreview && !description.trim()) {
      setError("Please add an image or care notes to share");
      return;
    }

    try {
      setLoading(true);
      const postPayload = {
        imageUrl: imagePreview || "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8d",
        description: description.trim() || "Field progress update from Sindh cotton farm",
      };

      const response = await axios.post("/api/posts", postPayload);
      setPosts([response.data, ...posts]);
      setSuccess("Post shared to PlantWise community!");
      setOpenModal(false);
      setSelectedImage(null);
      setImagePreview(null);
      setDescription("");
    } catch (err) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
      setSuccess("Post deleted successfully");
    } catch {
      setError("Failed to delete post");
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, { text: text.trim() });
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)));
      setCommentText({ ...commentText, [postId]: "" });
    } catch {
      setError("Failed to add comment");
    }
  };

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user?.displayName || "Farmer"}'s Plant Progress`,
          text: post.description,
          url: window.location.href,
        });
        setSuccess("Shared successfully!");
        return;
      } catch (err) {}
    }

    if (window.FB) {
      window.FB.ui(
        {
          method: "share",
          href: window.location.href,
          quote: post.description,
        },
        (response) => {
          if (response && !response.error_message) {
            setSuccess("Post shared to Facebook!");
          }
        }
      );
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSuccess("Link copied to clipboard!");
    }
  };

  if (authLoading) {
    return (
      <div style={{ paddingTop: "8.5rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ border: "4px solid #e2e8f0", borderTop: "4px solid #059669", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div style={{ paddingTop: "8.5rem", paddingBottom: "4rem", minHeight: "100vh", background: "#f4f9f4", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#ffffff", padding: "2.5rem", borderRadius: "24px", textAlign: "center", maxWidth: "480px", margin: "0 1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f4ea", color: "#059669", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            🌱
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#0f172a", fontSize: "1.5rem" }}>
            🔒 Registered Farmer Access Only
          </h2>
          <p style={{ color: "#475569", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", margin: "12px 0 24px 0", fontSize: "0.95rem" }}>
            Please log in with your account to access the Farmer Community, view regional field updates, and share disease reports.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "#059669", color: "#fff", fontWeight: 800, borderRadius: 30, padding: "12px 30px", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 20px rgba(5,150,105,0.25)" }}
          >
            🔑 LOGIN TO ACCESS COMMUNITY
          </button>
        </div>
      </div>
    );
  }

  const userSharedCount = posts.filter((p) => p.user?._id === user?._id).length;

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-[#f4f9f4]"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#f4f9f4",
        paddingTop: "112px",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
      }}
    >
      <Helmet>
        <title>Plant Care Community - PlantWise</title>
        <meta property="og:site_name" content="PlantWise Community" />
      </Helmet>

      {/* TOAST ALERTS */}
      {(error || success) && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: error ? "#ef4444" : "#10b981",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: "50px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {error ? "⚠️ " + error : "✅ " + success}
          <FaTimes style={{ cursor: "pointer", marginLeft: "8px" }} onClick={() => { setError(null); setSuccess(null); }} />
        </div>
      )}

      {/* FIXED VIEWPORT 3-COLUMN APP CONTAINER */}
      <div
        className="flex-1 flex justify-center gap-6 px-4 max-w-7xl mx-auto w-full overflow-hidden"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
          height: "calc(100vh - 112px)",
          overflow: "hidden",
        }}
      >
        
        {/* ======================================================== */}
        {/* 1. LEFT SIDEBAR (STICKY / FIXED HEIGHT PROFILE COLUMN) */}
        {/* ======================================================== */}
        {isDesktop && (
          <div
            className="w-72 shrink-0 h-full overflow-y-auto py-4 scrollbar-none hidden lg:block"
            style={{
              width: "288px",
              flexShrink: 0,
              height: "100%",
              overflowY: "auto",
              padding: "1rem 0 3rem 0",
              display: isDesktop ? "flex" : "none",
              flexDirection: "column",
              gap: "1.25rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            
            {/* User Profile Card */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", overflow: "hidden" }}>
              {/* Header Gradient Banner */}
              <div style={{ height: "75px", background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", position: "relative" }}>
                <div style={{ position: "absolute", bottom: "-28px", left: "20px" }}>
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.displayName}
                      style={{ width: "62px", height: "62px", borderRadius: "50%", border: "3px solid #ffffff", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                    />
                  ) : (
                    <div style={{ width: "62px", height: "62px", borderRadius: "50%", background: "#064e3b", color: "#ffffff", border: "3px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800 }}>
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "F"}
                    </div>
                  )}
                </div>
              </div>

              {/* User Bio Details */}
              <div style={{ padding: "36px 20px 20px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", margin: 0 }}>
                    {user?.displayName || "Registered Farmer"}
                  </h3>
                  <FaCheckCircle style={{ color: "#059669", fontSize: "0.9rem" }} title="Verified Grower" />
                </div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669", marginTop: "2px" }}>
                  🌾 Sindh Cotton Enthusiast
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FaMapMarkerAlt style={{ color: "#94a3b8" }} /> Khairpur / Sukkur Sector
                </div>

                {/* Live Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "8px 10px", textAlign: "center", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>
                      {userSharedCount}
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Plants Shared</div>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "8px 10px", textAlign: "center", border: "1px solid #f1f5f9" }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#059669" }}>
                      12
                    </div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>AI Scans</div>
                  </div>
                </div>

                {/* Edit Profile Link */}
                <div style={{ marginTop: "16px" }}>
                  <Link
                    to="/complete-profile"
                    style={{ display: "block", textAlign: "center", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "12px", padding: "8px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
                  >
                    ✏️ Edit Farmer Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Directory Card */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: "10px" }}>
                Quick Navigation
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link to="/outbreak-radar" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "10px", background: "#f8fafc", color: "#0f172a", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                  📡 <span>Outbreak Radar</span>
                </Link>
                <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "10px", background: "#f8fafc", color: "#0f172a", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                  🔬 <span>AI Disease Scanner</span>
                </Link>
                <Link to="/ar" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "10px", background: "#f8fafc", color: "#0f172a", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                  👓 <span>3D AR Plant Viewer</span>
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 2. CENTER COLUMN (HEADER + COMPOSE BOX + POSTS FEED) */}
        {/* ======================================================== */}
        <div
          className="flex-1 max-w-2xl h-full overflow-y-auto py-4 px-2 scrollbar-none"
          style={{
            flex: 1,
            maxWidth: "680px",
            width: "100%",
            height: "100%",
            overflowY: "auto",
            padding: "1rem 0.5rem 6rem 0.5rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* COMPACT COMMUNITY HEADER */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1.5px solid #bbf7d0", color: "#166534", fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", borderRadius: "50px", padding: "5px 18px", marginBottom: "0.5rem", boxShadow: "0 2px 8px rgba(5,150,105,0.06)" }}>
              <FaLeaf style={{ color: "#059669" }} /> SINDH FARMER COMMUNITY & FIELD FEED
            </div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "2.1rem", color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.5px" }}>
              Plant Care <span style={{ color: "#059669" }}>Community Hub</span>
            </h1>
            <p style={{ color: "#475569", fontSize: "0.92rem", margin: "0 auto", lineHeight: 1.4, fontWeight: 500 }}>
              Share field observations & verify disease symptoms across Sindh.
            </p>
          </div>
          
          {/* COMPOSE POST TRIGGER BOX */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.75rem",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              {user?.image ? (
                <img src={user.image} alt={user.displayName} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#059669", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, flexShrink: 0 }}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "F"}
                </div>
              )}
              <div
                onClick={() => setOpenModal(true)}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "50px",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  padding: "0 18px",
                  display: "flex",
                  alignItems: "center",
                  color: "#64748b",
                  fontSize: "0.92rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
              >
                What's happening with your crops? Share field update...
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#059669", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", padding: "6px 12px", borderRadius: "8px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <FaImage style={{ fontSize: "1rem" }} /> Photo / Video
              </button>

              <button
                type="button"
                onClick={() => setOpenModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#d97706", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", padding: "6px 12px", borderRadius: "8px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef3c7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <FaBug style={{ fontSize: "1rem" }} /> Pest Symptom
              </button>

              <button
                type="button"
                onClick={() => setOpenModal(true)}
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "30px",
                  padding: "8px 22px",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                }}
              >
                Share Post
              </button>
            </div>
          </div>

          {/* FEED POSTS TIMELINE */}
          {postsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
              <div style={{ border: "4px solid #e2e8f0", borderTop: "4px solid #059669", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" }}></div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "3rem 2rem", textAlign: "center" }}>
              <FaSeedling style={{ fontSize: "3rem", color: "#059669", marginBottom: "1rem" }} />
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#0f172a" }}>
                No Field Updates Yet
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "380px", margin: "6px auto 16px auto" }}>
                Be the first farmer to share a plant diagnosis or crop health observation with the community!
              </p>
              <button
                onClick={() => setOpenModal(true)}
                style={{ background: "#059669", color: "#ffffff", border: "none", borderRadius: "30px", padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => {
              const isLiked = post.likes && user && post.likes.includes(user._id);
              const isOwner = user && post.user && post.user._id === user._id;

              return (
                <div
                  key={post._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                    marginBottom: "1.5rem",
                    overflow: "hidden",
                  }}
                >
                  {/* POST HEADER */}
                  <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {post.user?.image ? (
                        <img
                          src={post.user.image}
                          alt={post.user.displayName}
                          style={{ width: "46px", height: "46px", borderRadius: "50%", objectFit: "cover", border: "2px solid #bbf7d0" }}
                        />
                      ) : (
                        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#059669", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800 }}>
                          {post.user?.displayName ? post.user.displayName.charAt(0).toUpperCase() : "F"}
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                            {post.user?.displayName || "Farmer"}
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "50px", fontWeight: 700 }}>
                            Grower
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        title="Delete Post"
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      >
                        <FaTrashAlt style={{ fontSize: "0.95rem" }} />
                      </button>
                    )}
                  </div>

                  {/* POST MEDIA IMAGE (RESTRICTED TO CLEAN HEIGHT & ASPECT RATIO) */}
                  {post.imageUrl && (
                    <div style={{ padding: "0 1.5rem" }}>
                      <img
                        src={post.imageUrl}
                        alt="Field crop observation"
                        style={{
                          width: "100%",
                          height: "300px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          border: "1px solid #f1f5f9",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  {/* POST CONTENT DESCRIPTION */}
                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      <span style={{ color: "#059669", marginRight: "6px" }}>🌱</span>
                      {post.description}
                    </p>

                    {/* POST ACTION BUTTONS BAR */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", marginTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(post._id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: isLiked ? "#fee2e2" : "#f8fafc",
                          color: isLiked ? "#dc2626" : "#475569",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "50px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isLiked ? <FaHeart style={{ color: "#dc2626" }} /> : <FaRegHeart />}
                        <span>{post.likes ? post.likes.length : 0} {post.likes?.length === 1 ? "Like" : "Likes"}</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => setCommentOpen({ ...commentOpen, [post._id]: !commentOpen[post._id] })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#f8fafc",
                          color: "#475569",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "50px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <FaRegComment />
                        <span>{post.comments ? post.comments.length : 0} Comments</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#f8fafc",
                          color: "#475569",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "50px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <FaShareAlt />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* EXPANDABLE COMMENTS SECTION */}
                    {commentOpen[post._id] && (
                      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                        {/* Add Comment Input */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                          <input
                            type="text"
                            value={commentText[post._id] || ""}
                            onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(post._id); }}
                            placeholder="Write a community reply..."
                            style={{
                              flex: 1,
                              height: "38px",
                              borderRadius: "30px",
                              border: "1.5px solid #e2e8f0",
                              padding: "0 14px",
                              fontSize: "0.88rem",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            style={{ background: "#059669", color: "#ffffff", border: "none", borderRadius: "30px", padding: "0 16px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                          >
                            Reply
                          </button>
                        </div>

                        {/* Comments List */}
                        {post.comments && post.comments.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {post.comments.map((cmt, idx) => (
                              <div key={idx} style={{ background: "#f8fafc", borderRadius: "14px", padding: "8px 12px", fontSize: "0.85rem" }}>
                                <div style={{ fontWeight: 700, color: "#0f172a" }}>{cmt.user?.displayName || "Farmer"}</div>
                                <div style={{ color: "#475569", marginTop: "2px" }}>{cmt.text}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>
                            No comments yet. Start the discussion!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. RIGHT SIDEBAR (TRENDING TOPICS & CONTRIBUTORS) */}
        {/* ======================================================== */}
        {isDesktop && (
          <div
            className="w-80 shrink-0 h-full overflow-y-auto py-4 scrollbar-none hidden xl:block"
            style={{
              width: "310px",
              flexShrink: 0,
              height: "100%",
              overflowY: "auto",
              padding: "1rem 0 4rem 0",
              display: isDesktop ? "flex" : "none",
              flexDirection: "column",
              gap: "1.25rem",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            
            {/* Trending Topics Card */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.25rem 1.4rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <FaFire style={{ color: "#ea580c", fontSize: "1.1rem" }} />
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>
                  Trending Topics
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { tag: "#FallArmywormGambat", posts: "42 field reports", trend: "High Threat" },
                  { tag: "#CottonBacterialBlight", posts: "28 field reports", trend: "Sukkur Sector" },
                  { tag: "#EveningSpraySchedule", posts: "19 advisories", trend: "Recommended" },
                  { tag: "#SindhWheatRustAlert", posts: "15 bulletins", trend: "Active" },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#059669", cursor: "pointer" }}>
                        {item.tag}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{item.posts}</div>
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "50px" }}>
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors Card */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.25rem 1.4rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <FiTrendingUp style={{ color: "#059669", fontSize: "1.1rem" }} />
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>
                  Top Contributors
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { name: "Ali Akbar", role: "Khairpur Mirs", score: "48 Verified Scans", avatar: "🌾" },
                  { name: "Muhammad Sheheryar", role: "Sukkur Agriculture", score: "34 Verified Scans", avatar: "🌱" },
                  { name: "Zayan Khan", role: "Gambat Sector", score: "26 Verified Scans", avatar: "🌿" },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                        {item.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{item.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{item.role}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#059669" }}>{item.score.split(" ")[0]} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Advisory Support */}
            <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderRadius: "20px", border: "1px solid #bbf7d0", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase" }}>
                <FaShieldAlt /> 24/7 Field Helpline
              </div>
              <p style={{ color: "#166534", fontSize: "0.85rem", margin: "6px 0 12px 0", lineHeight: 1.5 }}>
                Need urgent diagnosis for nocturnal pests or blight? Consult our agronomy team directly.
              </p>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", background: "#059669", color: "#ffffff", borderRadius: "10px", padding: "8px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}
              >
                Contact Agronomist on WhatsApp
              </a>
            </div>

            {/* Mini Essential Footer / Copyright */}
            <div style={{ padding: "4px 12px 20px 12px", textAlign: "center", fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.6 }}>
              <div>PlantWise Precision Agronomy © 2026</div>
              <div>Sindh Agricultural Digital Community</div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 4. MODERN DROPZONE FILE UPLOAD MODAL */}
      {/* ======================================================== */}
      {openModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1rem",
          }}
          onClick={() => setOpenModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaLeaf />
                </div>
                <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", margin: 0 }}>
                  Share Plant Progress
                </h3>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                style={{ background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              
              {/* FILE UPLOAD DROPZONE */}
              {imagePreview ? (
                <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: "2px solid #bbf7d0", marginBottom: "1.25rem", maxHeight: "240px" }}>
                  <img src={imagePreview} alt="Selected preview" style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.65)", color: "#ffffff", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: dragActive ? "2px dashed #059669" : "2px dashed #cbd5e1",
                    background: dragActive ? "#f0fdf4" : "#f8fafc",
                    borderRadius: "18px",
                    padding: "2rem 1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: "1.25rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.background = "#f0fdf4"; }}
                  onMouseLeave={(e) => { if (!dragActive) { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; } }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", fontSize: "1.6rem" }}>
                    <FaCloudUploadAlt />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>
                    Click to upload or drag & drop plant photo
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                    Supports PNG, JPG, JPEG, WebP up to 10MB
                  </div>
                </div>
              )}

              {/* CARE NOTES TEXTAREA */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Plant Care Notes & Observations
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe crop status, leaf discoloration, pest symptoms, or location..."
                  style={{
                    width: "100%",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    padding: "12px 14px",
                    fontSize: "0.92rem",
                    color: "#0f172a",
                    outline: "none",
                    resize: "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "30px", padding: "10px 20px", fontWeight: 700, fontSize: "0.88rem", color: "#475569", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={loading || (!imagePreview && !description.trim())}
                style={{
                  background: loading || (!imagePreview && !description.trim()) ? "#94a3b8" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  cursor: loading || (!imagePreview && !description.trim()) ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(5,150,105,0.25)",
                }}
              >
                {loading ? "Sharing Update..." : "Share Plant Update"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SocialMedia;