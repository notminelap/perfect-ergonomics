import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2600);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="orb-1" style={{ position: 'absolute', top: '-15%', left: '15%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.32) 0%, transparent 65%)', filter: 'blur(2px)' }} />
        <div className="orb-2" style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.22) 0%, transparent 65%)' }} />
        <div className="orb-3" style={{ position: 'absolute', top: '40%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.14) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Logo icon */}
      <motion.div
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.1 }}
        style={{
          width: 88, height: 88, borderRadius: 30,
          background: 'linear-gradient(135deg, #0071e3 0%, #00b4d8 50%, #30d158 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 80px rgba(0,113,227,0.55), 0 0 40px rgba(0,180,216,0.3)',
          position: 'relative', zIndex: 1,
        }}
      >
        <Package size={44} color="white" strokeWidth={1.5} />
      </motion.div>

      {/* Brand name */}
      <div style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <motion.h1
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42, type: 'spring', bounce: 0.28, duration: 0.7 }}
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900,
            letterSpacing: '-0.04em', textAlign: 'center', color: '#f5f5f7', margin: 0,
          }}
        >
          Perfect Ergonomics
        </motion.h1>
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.45, y: 0 }}
        transition={{ delay: 0.82, duration: 0.5 }}
        style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#f5f5f7', margin: 0, position: 'relative', zIndex: 1 }}
      >
        Warehouse Management System
      </motion.p>

      {/* Bottom progress bar */}
      <motion.div
        style={{ position: 'absolute', bottom: 0, left: 0, height: 3, borderRadius: '0 3px 3px 0', background: 'linear-gradient(90deg, #0071e3, #00d4ff, #30d158)' }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 2.2, delay: 0.2, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
