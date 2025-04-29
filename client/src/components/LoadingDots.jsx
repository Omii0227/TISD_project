import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 }
  };

  return (
    <div className="loading-dots">
      <p>Thinking</p>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: dot * 0.2
          }}
          className="dot"
        >
          .
        </motion.span>
      ))}
    </div>
  );
};

export default LoadingDots;