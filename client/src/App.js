// App.js - Enhanced UI Component
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import ChatMessage from './components/ChatMessage';
import Suggestions from './components/Suggestions';
import LoadingDots from './components/LoadingDots';
import farmingIcon from './assets/farming-icon.svg';
axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your Urban Farming Assistant. How can I help you grow your urban garden today?", 
      sender: 'bot', 
      id: 1 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState([
    "How do I start vertical farming?",
    "Best crops for rooftop gardens in India",
    "Using hydrogels in urban gardens",
    "What is agritecture?",
    "Urban farming techniques for small spaces"
  ]);
  
  const messagesEndRef = useRef(null);
  // Generate a persistent user ID for this session
  const [userId] = useState('user-' + Math.floor(Math.random() * 1000000));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Particle animation effect
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#8BC34A', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];
    const sizes = [5, 8, 12, 15, 20];
    const speeds = [15, 20, 25, 30, 35];

    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        left: `${Math.random() * 100}%`,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: speeds[Math.floor(Math.random() * speeds.length)],
        delay: Math.random() * 10
      });
    }
    
    setParticles(newParticles);
  }, []);

  // Function to verify server is running
  useEffect(() => {
    const testServerConnection = async () => {
      try {
        const response = await axios.get('/api/test');
        console.log('Server connection test:', response.data);
      } catch (error) {
        console.error('Server connection test failed:', error);
        setMessages(prev => [...prev, { 
          text: "⚠ Could not connect to the server. Please make sure the backend server is running.", 
          sender: 'bot', 
          id: Date.now() 
        }]);
      }
    };
    
    testServerConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    const userMessage = { text: input, sender: 'user', id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log("Sending message to API:", input);
      
      // Call to backend API
      const response = await axios.post('/api/chat', { 
        message: input,
        userId: userId // Use the persistent user ID
      });
      
      console.log("Received response:", response.data);
      
      // Add some delay to make the typing effect feel more natural
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: response.data.message, 
          sender: 'bot', 
          id: Date.now() 
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Display more specific error information
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      // Check for specific error details from the API
      if (error.response) {
        console.log('Error response data:', error.response.data);
        if (error.response.data.details) {
          errorMessage = `Error: ${error.response.data.details}`;
        }
      } else if (error.request) {
        // Request was made but no response was received
        errorMessage = "Server is not responding. Please check if the backend is running.";
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        sender: 'bot', 
        id: Date.now() 
      }]);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    // Optional: Auto-submit when clicking a suggestion
    // This makes the suggestion work immediately
    setTimeout(() => {
      document.querySelector('.send-button').click();
    }, 100);
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="app-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated background particles */}
      <div className="particles-container">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="particle"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            animate={{
              y: [0, -window.innerHeight],
              rotate: [0, 360],
              opacity: [0.1, 0.7, 0.1]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="header"
      >
        <div className="logo-container">
          <motion.img 
            src={farmingIcon} 
            alt="Urban Farming Icon" 
            className="logo"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
          />
          <motion.h1
            animate={{ 
              color: ["#ffffff", "#e8f5e9", "#ffffff"],
              textShadow: [
                "0 2px 4px rgba(0, 0, 0, 0.2)",
                "0 0 10px rgba(139, 195, 74, 0.8)",
                "0 2px 4px rgba(0, 0, 0, 0.2)"
              ]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          >
            AgriPod
          </motion.h1>
        </div>
      </motion.header>

      <motion.div 
        className="chat-container"
        variants={itemVariants}
      >
        <motion.div 
          className="messages-container"
          variants={itemVariants}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 25,
                  delay: index * 0.1 % 0.5 // Create a staggered effect but limit delay
                }}
              />
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="typing-indicator"
            >
              <LoadingDots />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        <motion.div
          variants={itemVariants}
        >
          <Suggestions 
            suggestions={suggestions} 
            onClick={handleSuggestionClick} 
          />
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="input-form"
          variants={itemVariants}
        >
          <motion.input
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about urban farming..."
            className="chat-input"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="send-button"
            disabled={isLoading}
          >
            <span className="button-text">Send</span>
            <span className="send-icon">→</span>
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

export default App;