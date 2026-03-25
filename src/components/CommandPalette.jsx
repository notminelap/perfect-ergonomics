import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Plus, Download, Moon, Sun, BarChart3, Package, ArrowRight, Zap } from 'lucide-react';

export default function CommandPalette({ inventory = [], onAddItem, onExportCSV, theme, onSetTheme, onNavTo }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  const actions = useMemo(() => [
    { id: 'add',       icon: <Plus size={15} />,     label: 'Add New Item',          desc: 'Create a new inventory entry',      shortcut: 'N',  action: () => { onAddItem(); setOpen(false); } },
    { id: 'export',    icon: <Download size={15} />,  label: 'Export CSV',            desc: 'Download full inventory as CSV',                    action: () => { onExportCSV(); setOpen(false); } },
    { id: 'analytics', icon: <BarChart3 size={15} />, label: 'View Analytics',        desc: 'Switch to analytics dashboard',                     action: () => { onNavTo('analytics'); setOpen(false); } },
    { id: 'theme',     icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />, label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', desc: 'Toggle colour scheme', action: () => { onSetTheme(t => t === 'dark' ? 'light' : 'dark'); setOpen(false); } },
  ], [theme, onAddItem, onExportCSV, onNavTo, onSetTheme]);

  const itemResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return inventory
      .filter(i => [i.model, i.color, i.description, i.sku, i.id].some(f => f?.toLowerCase?.().includes(q)))
      .slice(0, 6)
      .map(item => ({
        id: `item-${item.id}`,
        icon: item.image
          ? <img src={item.image} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
          : <Package size={15} />,
        label: item.model,
        desc: `${item.color} · ${item.quantity} in stock`,
        action: () => setOpen(false),
      }));
  }, [inventory, query]);

  const filteredActions = useMemo(() =>
    query.trim() ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase())) : actions
  , [actions, query]);

  const all = [...filteredActions, ...itemResults];

  // Open/close shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(v => !v); setQuery(''); setSelected(0); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  // Arrow key + enter nav
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, all.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter')     { all[selected]?.action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, all]);

  const Row = ({ item, idx }) => {
    const active = selected === idx;
    return (
      <div
        onMouseEnter={() => setSelected(idx)}
        onClick={item.action}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 18px', cursor: 'pointer',
          background: active ? 'rgba(59,158,255,0.13)' : 'transparent',
          borderLeft: `2px solid ${active ? 'rgba(59,158,255,0.7)' : 'transparent'}`,
          transition: 'background 0.08s',
        }}
      >
        <span style={{ color: active ? '#3b9eff' : 'rgba(255,255,255,0.38)', flexShrink: 0, display: 'flex' }}>{item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: active ? '#fff' : 'rgba(255,255,255,0.78)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
          {item.desc && <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{item.desc}</div>}
        </div>
        {item.shortcut && <kbd style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.07)', padding: '2px 7px', borderRadius: 5, fontFamily: 'inherit', flexShrink: 0 }}>{item.shortcut}</kbd>}
        {!item.shortcut && active && <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />}
      </div>
    );
  };

  const Section = ({ label }) => (
    <div style={{ padding: '8px 18px 4px', fontSize: '0.66rem', fontWeight: 800, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)' }}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: 'spring', bounce: 0.22, duration: 0.35 }}
            style={{
              position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
              width: 'min(620px, 92vw)', zIndex: 8001,
              background: 'rgba(14,14,18,0.97)',
              backdropFilter: 'blur(40px)',
              borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)',
              overflow: 'hidden', fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <Command size={18} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Type a command or search items…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.98rem', fontFamily: 'inherit', letterSpacing: '-0.01em' }}
              />
              {query && <button onClick={() => setQuery('')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.72rem', padding: '3px 8px', fontFamily: 'inherit' }}>clear</button>}
              <kbd style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '3px 7px', borderRadius: 6, fontFamily: 'inherit', flexShrink: 0 }}>esc</kbd>
            </div>

            {/* Results list */}
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }}>
              {all.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.88rem' }}>
                  <Zap size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.2 }} />
                  No results for "{query}"
                </div>
              ) : (
                <>
                  {filteredActions.length > 0 && <Section label={query ? 'Actions' : 'Quick Actions'} />}
                  {filteredActions.map((item, i) => <Row key={item.id} item={item} idx={i} />)}
                  {itemResults.length > 0 && (
                    <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                      <Section label="Inventory" />
                      {itemResults.map((item, i) => <Row key={item.id} item={item} idx={filteredActions.length + i} />)}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 14, fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', alignItems: 'center' }}>
              {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([k, v]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4, fontFamily: 'inherit' }}>{k}</kbd>{v}
                </span>
              ))}
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4, fontFamily: 'inherit' }}>⌘K</kbd> command palette
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
