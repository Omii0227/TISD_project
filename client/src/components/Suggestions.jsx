import React from 'react';
import { motion } from 'framer-motion';

const Suggestions = ({ suggestions, onClick }) => {
  return (
    <div className="suggestions-container">
      <p className="suggestions-title">Suggested questions:</p>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.03, backgroundColor: '#2ecc71' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="suggestion-chip"
            onClick={() => onClick(suggestion)}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;