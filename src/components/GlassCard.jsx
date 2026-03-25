import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div 
      className={`apple-card ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
