import React, { useState, useEffect } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './testimonials.css';

const testimonialsData = [
  {
    id: 1,
    quote:
      '"PlantWise AI detected Bacterial Blight on my cotton crop in Khairpur within 10 seconds. The WhatsApp alert saved my entire 15-acre yield from destruction!"',
    name: 'Tariq Mehmood',
    role: 'Cotton Grower, Khairpur, Sindh',
  },
  {
    id: 2,
    quote:
      '"Before spraying pesticides, I check the weather guard. It prevented pesticide washout during last month\'s rain alert, saving me Rs. 85,000 in chemical costs."',
    name: 'Ghulam Rasool',
    role: 'Potato & Tomato Farmer, Sukkur, Sindh',
  },
  {
    id: 3,
    quote:
      '"The Sindhi & Urdu advice in WhatsApp makes it so simple to use for my entire family. Every farmer in Gambat is using PlantWise for instant leaf scans now."',
    name: 'Zubair Ahmed',
    role: 'Progressive Agriculture Farmer, Gambat, Sindh',
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

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonialsData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const currentTestimonial = testimonialsData[activeIndex];

  return (
    <motion.section
      className="testimonials-section"
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* Abstract World Map Dots Matrix Overlay */}
      <div 
        className="world-map-bg" 
        style={{ backgroundImage: `url('/assets/images/vecteezy_dotted-world-map_36643421.svg')` }}
      ></div>

      {/* Floating Animated Plant Images (Crucial) */}
      <img
        src="/assets/images/testimonial-img-6.png"
        alt="Floating mint leaf"
        className="floating-plant plant-left"
      />
      <img
        src="/assets/images/h1-slider4.png"
        alt="Foreground blurred depth leaf"
        className="floating-plant plant-blurred"
      />
      <img
        src="/assets/images/testimonial-img-7.png"
        alt="Floating fresh leaf"
        className="floating-plant plant-right"
      />

      {/* Scattered Tilted Farmer Photo Cards */}
      <div className="tilted-card card-top-left">
        <img src="/assets/images/farmer check crop.png" alt="Farmer in field" />
      </div>
      <div className="tilted-card card-bottom-left">
        <img src="/assets/images/happy farmer.png" alt="Smiling farmer" />
      </div>
      <div className="tilted-card card-top-right">
        <img src="/assets/images/home4-slider-03.jpg" alt="Sindh cotton field" />
      </div>
      <div className="tilted-card card-bottom-right">
        <img src="/assets/images/78522ad5-4b91-43c2-8182-67239aff50a7.png" alt="Farmer scanning crop" />
      </div>

      {/* Center Main Content */}
      <div className="testimonials-content">
        {/* Top Tagline */}
        <div className="testimonials-tagline">
          <FaLeaf className="testimonials-tagline-icon" />
          <span>FARMER STORIES</span>
        </div>

        {/* Main Section Heading */}
        <h2 className="testimonials-heading">
          Hear From Our Local Farmers
        </h2>

        {/* Slider Quote Box */}
        <div className="testimonial-quote-box fade-in-quote" key={currentTestimonial.id}>
          <p className="testimonial-quote-text">{currentTestimonial.quote}</p>
          <div className="testimonial-author">
            <h4 className="author-name">{currentTestimonial.name}</h4>
            <span className="author-role">{currentTestimonial.role}</span>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="testimonials-dots">
          {testimonialsData.map((_, index) => (
            <button
              key={index}
              className={`dot-btn ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
