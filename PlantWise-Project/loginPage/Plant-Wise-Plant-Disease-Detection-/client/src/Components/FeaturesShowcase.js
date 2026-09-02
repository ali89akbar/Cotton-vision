import React, { useState, useEffect } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './featuresShowcase.css';

const featuresData = [
  {
    id: 1,
    title: '01· WhatsApp AI Bot',
    imageUrl: '/assets/images/whatsapp.png',
  },
  {
    id: 2,
    title: '02· Instant Disease Detection',
    imageUrl: '/assets/images/scanning.png',
  },
  {
    id: 3,
    title: '03· Smart Weather Alerts',
    imageUrl: '/assets/images/weather warning.png',
  },
  {
    id: 4,
    title: '04· Actionable Treatments',
    imageUrl: '/assets/images/fertilizer.png',
  },
  {
    id: 5,
    title: '05· ROI & Cost Savings',
    imageUrl: '/assets/images/cotton.png',
  },
];

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 55 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const FeaturesShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % featuresData.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleHover = (index) => {
    setActiveIndex(index);
  };

  return (
    <motion.section
      className="features-showcase-section"
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="features-showcase-card">
        {/* Top Tagline */}
        <div className="showcase-tagline">
          <FaLeaf className="showcase-tagline-icon" />
          <span>PLANTWISE FEATURES</span>
        </div>

        {/* Main Heading */}
        <h2 className="showcase-heading">
          Smart AI Tools Designed For Local Farmers
        </h2>

        {/* Split Grid Content */}
        <div className="showcase-grid">
          {/* Left Column: Image with cross-fade opacity transition */}
          <div className="showcase-image-container">
            {featuresData.map((feature, index) => (
              <img
                key={feature.id}
                src={feature.imageUrl}
                alt={feature.title}
                className={`showcase-image ${index === activeIndex ? 'active' : ''}`}
              />
            ))}
          </div>

          {/* Right Column: Numbered Interactive List */}
          <div className="showcase-list">
            {featuresData.map((feature, index) => (
              <div
                key={feature.id}
                className={`showcase-list-item ${index === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => handleHover(index)}
              >
                <span className="item-title">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesShowcase;
