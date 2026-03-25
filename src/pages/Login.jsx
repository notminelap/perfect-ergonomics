import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    if (username === 'owner' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials. Try owner / admin123');
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="center-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="orb-1" style={{ position: 'absolute', top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.22) 0%, transparent 65%)', filter: 'blur(2px)' }} />
        <div className="orb-2" style={{ position: 'absolute', bottom: '-5%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.14) 0%, transparent 65%)' }} />
        <div className="orb-3" style={{ position: 'absolute', top: '40%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <motion.div
        className="login-card apple-card"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.35, delay: 0.1 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <motion.div
            style={{ display: 'inline-flex', marginBottom: '1.25rem', padding: '18px', borderRadius: '28px', background: 'linear-gradient(135deg, #0071e3, #00b4d8)' }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', bounce: 0.5 }}
          >
            <Package size={36} color="white" strokeWidth={1.8} />
          </motion.div>
          <motion.h1
            style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Perfect Ergonomics
          </motion.h1>
          <motion.p
            style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            Warehouse Manager Portal
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="apple-input"
              type="text"
              placeholder="owner"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="apple-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: '48px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ color: 'var(--red)', fontSize: '0.85rem', fontWeight: 500, padding: '10px 14px', background: 'rgba(255,69,58,0.08)', borderRadius: '12px' }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="apple-button primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '15px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
