import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function GlassButton({ children, className = '', variant = 'default', ...props }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className={`apple-button ${variant !== 'default' ? variant : ''} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
}
