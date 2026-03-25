import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function GlassInput({ label, id, className = '', ...props }) {
  return (
    <motion.div 
      className={`input-group ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && <label htmlFor={id}>{label}</label>}
      <input 
        id={id}
        className="apple-input"
        {...props}
      />
    </motion.div>
  );
}
