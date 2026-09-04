import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  FaBrain,
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaLeaf,
  FaRobot,
  FaUser,
  FaSparkles,
} from 'react-icons/fa';

const SUGGESTED_QUESTIONS = [
  'How to identify & treat Fall Armyworm in cotton?',
  'What is the best time and temperature for spraying?',
  'How to cure Bacterial Blight on cotton leaves?',
  'Symptoms of Nitrogen deficiency in crops?',
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'qwen',
      text: 'Salam! I am your Alibaba Qwen AI Agronomist Copilot 🌾. Ask me any question regarding crop diseases, chemical dosage, or pesticide safety across Sindh.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:6005/api/ai/chat',
        { message: queryText },
        { withCredentials: true }
      );

      const replyText = response.data?.reply || 'AI Service response received.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'qwen',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error('Qwen Copilot chat error:', error);
      const errReply = error.response?.data?.reply || error.response?.data?.message || 'AI Service unavailable. Please check backend connection and QWEN_API key.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'qwen',
          text: errReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[100]"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(5, 150, 105, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.4)';
          }}
          title="Open Qwen AI Agronomist Copilot"
        >
          <FaComments />
          {/* Active Ping Dot */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#34d399',
              border: '2px solid #ffffff',
            }}
          ></span>
        </button>
      )}

      {/* CHAT POPUP WINDOW */}
      {isOpen && (
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          onWheel={(e) => e.stopPropagation()}
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 100px)',
            background: '#ffffff',
            borderRadius: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out',
            overscrollBehavior: 'contain',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  fontSize: '1.2rem',
                }}
              >
                <FaBrain />
              </div>
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Qwen AI Copilot</span>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(52, 211, 153, 0.2)', color: '#6ee7b7', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '2px 6px', borderRadius: '50px', fontWeight: 700 }}>
                    Alibaba LLM
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
                  Sindh Precision Agronomy Copilot
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              <FaTimes />
            </button>
          </div>

          {/* MESSAGES TIMELINE */}
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            onWheel={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f8fafc',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '84%',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.sender === 'user' ? '#059669' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  {typeof msg.text === 'string'
                    ? msg.text.replace(/\*\*/g, '').replace(/\*/g, '')
                    : msg.text}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', alignSelf: 'flex-start', maxWidth: '80%' }}>
                <FaLeaf style={{ color: '#059669', animation: 'spin 2s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  Alibaba Qwen is formulating advice...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTION CHIPS */}
          {messages.length <= 2 && (
            <div style={{ padding: '8px 12px', background: '#f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid #e2e8f0' }}>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    whiteSpace: 'nowrap',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '50px',
                    padding: '4px 12px',
                    fontSize: '0.74rem',
                    color: '#0f172a',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.color = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <div
            style={{
              padding: '1rem',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Qwen e.g. Can I spray in humidity?"
              disabled={isLoading}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '50px',
                border: '1.5px solid #e2e8f0',
                padding: '0 16px',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                background: '#f8fafc',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#059669')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isLoading || !inputMessage.trim() ? '#cbd5e1' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                boxShadow: isLoading || !inputMessage.trim() ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
