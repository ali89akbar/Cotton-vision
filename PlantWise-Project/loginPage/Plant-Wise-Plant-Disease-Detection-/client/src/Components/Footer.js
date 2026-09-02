import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaPaperPlane,
  FaCheckCircle,
  FaWhatsapp,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowRight,
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 500);
  };

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #061e16 0%, #04140f 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* 🌾 BOTANICAL WHEAT LEFT BACKGROUND ARTWORK (SYMMETRICAL MIRROR) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "auto",
          height: "100%",
          maxHeight: "450px",
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-start",
        }}
      >
        <img
          src="/assets/images/footer-wheat.png"
          alt="Wheat Background Left"
          style={{
            height: "100%",
            maxHeight: "420px",
            width: "auto",
            objectFit: "contain",
            mixBlendMode: "screen",
            opacity: 0.65,
            transform: "scaleX(-1)",
            filter: "brightness(1.4) drop-shadow(0 0 25px rgba(52, 211, 153, 0.25))",
          }}
        />
      </div>

      {/* 🌾 BOTANICAL WHEAT RIGHT BACKGROUND ARTWORK */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "auto",
          height: "100%",
          maxHeight: "450px",
          pointerEvents: "none",
          zIndex: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        }}
      >
        <img
          src="/assets/images/footer-wheat.png"
          alt="Wheat Background Right"
          style={{
            height: "100%",
            maxHeight: "420px",
            width: "auto",
            objectFit: "contain",
            mixBlendMode: "screen",
            opacity: 0.65,
            filter: "brightness(1.4) drop-shadow(0 0 25px rgba(52, 211, 153, 0.25))",
          }}
        />
      </div>

      {/* SUBTLE AMBIENT LIGHT GLOW */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "20%",
          width: "500px",
          height: "300px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 30, 22, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      ></div>

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "4rem 1.5rem 2rem 1.5rem", position: "relative", zIndex: 1 }}>
        
        {/* 1. TOP NEWSLETTER SUBSCRIPTION BAR (CLEAN, BORDERLESS SAAS DESIGN) */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "24px",
            padding: "2.25rem 2.5rem",
            marginBottom: "3.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }}></span> NEWSLETTER
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "#ffffff", margin: "0 0 0.4rem 0", letterSpacing: "-0.5px" }}>
              Stay Updated with Agro-Intelligence
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#94a3b8", margin: 0, maxWidth: "540px", lineHeight: 1.5 }}>
              Get weekly crop disease forecasts, pesticide spray reminders, and regional pest radar updates.
            </p>
          </div>

          <div style={{ flex: 1, minWidth: "280px", maxWidth: "460px" }}>
            {isSubscribed ? (
              <div style={{ background: "rgba(16, 185, 129, 0.15)", borderRadius: "18px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px", color: "#ffffff" }}>
                <FaCheckCircle style={{ color: "#34d399", fontSize: "1.5rem", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ffffff" }}>Subscribed Successfully!</div>
                  <div style={{ fontSize: "0.8rem", color: "#a7f3d0" }}>You will receive our latest agricultural bulletins.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                  <FaEnvelope style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "0.9rem" }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    style={{
                      width: "100%",
                      height: "48px",
                      borderRadius: "50px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "none",
                      paddingLeft: "42px",
                      paddingRight: "16px",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    height: "48px",
                    borderRadius: "50px",
                    background: "#059669",
                    color: "#ffffff",
                    border: "none",
                    padding: "0 24px",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#059669")}
                >
                  <FaPaperPlane /> {submitting ? "Joining..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 2. MAIN 4-COLUMN FOOTER NAVIGATION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem 2rem",
            marginBottom: "3.5rem",
          }}
        >
          
          {/* COLUMN 1: BRAND & MISSION */}
          <div style={{ maxWidth: "320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "1.15rem",
                }}
              >
                <FaLeaf />
              </div>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.55rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
                Plant<span style={{ color: "#34d399" }}>Wise</span>
              </span>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Empowering agriculture with AI-driven plant disease diagnostics, satellite microclimate telemetry, and real-time pest outbreak surveillance.
            </p>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { icon: <FaFacebookF />, href: "https://facebook.com" },
                { icon: <FaTwitter />, href: "https://twitter.com" },
                { icon: <FaLinkedinIn />, href: "https://linkedin.com" },
                { icon: <FaInstagram />, href: "https://instagram.com" },
                { icon: <FaWhatsapp />, href: "https://whatsapp.com" },
                { icon: <FaGithub />, href: "https://github.com" },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.82rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#cbd5e1";
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div>
            <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem" }}>
              Quick Links
            </h4>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { label: "Home", path: "/" },
                { label: "Outbreak Radar", path: "/outbreak-radar" },
                { label: "AI Disease Scanner", path: "/dashboard" },
                { label: "3D AR Plant Viewer", path: "/ar" },
                { label: "Farmer Community", path: "/social-media" },
                { label: "Saved Diagnosis Records", path: "/saved-plants" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: PLATFORM & SOLUTIONS */}
          <div>
            <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem" }}>
              Solutions & Monitoring
            </h4>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { label: "Cotton Pest Surveillance", path: "/outbreak-radar" },
                { label: "Live Satellite Telemetry", path: "/outbreak-radar" },
                { label: "Agronomic Chemical Advisory", path: "/outbreak-radar" },
                { label: "Leaf Health Diagnostics", path: "/dashboard" },
                { label: "Farmer Profile Verification", path: "/complete-profile" },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.path}
                    style={{
                      color: "#94a3b8",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONTACT & SUPPORT */}
          <div>
            <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "1.25rem" }}>
              Get in Touch
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem", color: "#94a3b8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt style={{ color: "#059669", flexShrink: 0 }} />
                <span>Agricultural Belt, Sindh, Pakistan</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaEnvelope style={{ color: "#059669", flexShrink: 0 }} />
                <span>support@plantwise.pk</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaPhoneAlt style={{ color: "#059669", flexShrink: 0 }} />
                <span>+92 300 1234567</span>
              </div>

              {/* Minimal Clean Helpline Button */}
              <div style={{ marginTop: "8px" }}>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    color: "#34d399",
                    padding: "9px 18px",
                    borderRadius: "30px",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "#34d399";
                  }}
                >
                  <FaWhatsapp style={{ fontSize: "1rem" }} /> 24/7 Farmer Advisory <FaArrowRight style={{ fontSize: "0.7rem" }} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM COPYRIGHT & LEGAL BAR (CLEAN & SUBTLE) */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.84rem",
            color: "#64748b",
          }}
        >
          <div>
            <span>Copyright © {new Date().getFullYear()} </span>
            <strong style={{ color: "#e2e8f0" }}>PlantWise Inc.</strong>
            <span> All rights reserved.</span>
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")} onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
              Privacy Policy
            </span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")} onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
              Terms of Service
            </span>
            <span style={{ color: "#34d399", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", display: "inline-block" }}></span>
              Live Systems Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
