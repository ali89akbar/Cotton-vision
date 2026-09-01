import React, { useState } from 'react';
import { FaLeaf } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './faqSection.css';

const faqData = [
  {
    id: '01',
    question: '01. How does PlantWise detect crop diseases?',
    answer:
      'You simply need to send a clear photo of the infected leaf to our WhatsApp bot. Our AI instantly analyzes the image and replies with the exact disease name and actionable treatment recommendations in local languages.',
  },
  {
    id: '02',
    question: '02. Which crops do you currently support?',
    answer:
      'Currently, our AI model is highly trained to detect diseases in Cotton, Potato, and Tomato crops with over 95% accuracy. We plan to expand to more regional crops soon.',
  },
  {
    id: '03',
    question: '03. How do the Smart Weather Alerts work?',
    answer:
      'We integrate real-time weather data for your specific location. If rain or extreme conditions are predicted, our bot warns you beforehand so you don\'t waste expensive pesticides or fertilizers.',
  },
  {
    id: '04',
    question: '04. Is the PlantWise service free for farmers?',
    answer:
      'Yes, the core disease detection and weather alert service is completely free to use via WhatsApp. Our goal is to empower local farmers and maximize their yield without adding extra costs.',
  },
  {
    id: '05',
    question: '05. Do I need a high-speed internet connection?',
    answer:
      'Not at all! The system is built entirely on WhatsApp, which requires very low bandwidth. If you can send a message on WhatsApp, you can use PlantWise.',
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

const FaqSection = () => {
  const [activeId, setActiveId] = useState('01');

  const toggleFaq = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <motion.section
      className="faq-section"
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="faq-container">
        {/* Top Tagline & Heading */}
        <div className="faq-header">
          <div className="faq-tagline">
            <FaLeaf className="faq-tagline-icon" />
            <span>QUERIES</span>
          </div>
          <h2 className="faq-heading">Frequently Asked Questions</h2>
        </div>

        {/* 2-Column Split Grid */}
        <div className="faq-grid">
          {/* Left Column: 5 Accordion Items */}
          <div className="faq-accordion-list">
            {faqData.map((item) => {
              const isOpen = activeId === item.id;
              return (
                <div
                  key={item.id}
                  className={`faq-item ${isOpen ? 'active' : ''}`}
                  onClick={() => toggleFaq(item.id)}
                >
                  <div className="faq-question-row">
                    <h3 className="faq-question">{item.question}</h3>
                    <FiChevronDown className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="faq-answer-wrapper fade-in-faq">
                      <p className="faq-answer">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: FAQ Image */}
          <div className="faq-image-wrapper">
            <img
              src="/assets/images/faq-image.png"
              alt="PlantWise FAQ Agricultural Field"
              className="faq-image"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default FaqSection;
