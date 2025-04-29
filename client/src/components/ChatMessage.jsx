import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import botAvatar from '../assets/bot-avatar.svg';
import userAvatar from '../assets/user-avatar.svg';

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`message ${isBot ? 'bot-message' : 'user-message'}`}
    >
      <div className="avatar-container">
        <img 
          src={isBot ? botAvatar : userAvatar} 
          alt={isBot ? "Bot Avatar" : "User Avatar"} 
          className="avatar"
        />
      </div>
      <div className="message-content">
        {isBot ? (
          <ReactMarkdown>{message.text}</ReactMarkdown>
        ) : (
          <p>{message.text}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;