import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import CommandPalette from '../components/CommandPalette';
import {
  LogOut, Plus, Image as ImageIcon, Search,
  Edit2, Trash2, History, ArrowDownToLine, ArrowUpFromLine,
  X, Box, BarChart3, AlertTriangle, CheckCircle2,
  Layers, Package, Activity, Download, Clock, SlidersHorizontal,
  ArrowDown, ArrowUp, Sun, Moon
} from 'lucide-react';

/* ─────────── helpers ─────────── */
const fmt  = n  => Number(n).toLocaleString('en-IN');
const fmtD = ds => new Date(ds).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const API  = '/api';
const sp   = { type: 'spring', bounce: 0.3, duration: 0.5 };

/* ──── Fire confetti celebration ──── */
const fireConfetti = () => {
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const randomInRange = (min, max) => Math.random() * (max - min) + min;
  confetti({ ...defaults, particleCount: 80, origin: { x: randomInRange(0.1, 0.3), y: 0.4 } });
  confetti({ ...defaults, particleCount: 80, origin: { x: randomInRange(0.7, 0.9), y: 0.4 } });
};

/* ──── 3D Tilt Card wrapper ──── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { damping: 30, stiffness: 200 });
  const brightness = useSpring(useTransform(y, [-0.5, 0.5], [1.04, 0.96]), { damping: 30 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ ...style, rotateX, rotateY, filter: useTransform(brightness, b => `brightness(${b})`), transformStyle: 'preserve-3d', perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──── Word-by-word reveal animation ──── */
function WordReveal({ text, style }) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: i < words.length - 1 ? '0.3em' : 0 }}>
          <motion.span
            display="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring', bounce: 0.28, duration: 0.7 }}
            style={{ display: 'inline-block' }}
          >{word}</motion.span>
        </span>
      ))}
    </span>
  );
}

/* ──── Skeleton loading card ──── */
function SkeletonCard() {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ width: '100%', paddingTop: '60%' }} />
      <div style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: '40%', borderRadius: 6, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '80%', borderRadius: 6, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 12, marginBottom: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="skeleton" style={{ height: 36, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 36, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}
function AnimatedNumber({ value }) {
  const [display, setDisplay] = React.useState(0);
  const prev = React.useRef(0);
  React.useEffect(() => {
    const start = prev.current;
    const end = Number(value);
    prev.current = end;
    if (start === end) { setDisplay(end); return; }
    const duration = 900;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{fmt(display)}</>;
}

/* ─────────── Live Clock ─────────── */
function LiveClock() {
  const [t, setT] = React.useState(new Date());
  React.useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
      <Clock size={12} />
      {t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </span>
  );
}

/* ─────────── animation variants ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: sp }
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } }
};
const modalV = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
  exit:   { opacity: 0 }
};
const panelV = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: sp },
  exit:   { opacity: 0, y: 24, scale: 0.97 }
};

/* ─────────── Tag pill ─────────── */
function Tag({ children, color = 'neutral' }) {
  const map = {
    neutral: { bg: 'rgba(255,255,255,0.06)', fg: 'var(--text-2)' },
    green:   { bg: 'rgba(48,209,88,0.13)',   fg: 'var(--green)'  },
    red:     { bg: 'rgba(255,69,58,0.13)',    fg: 'var(--red)'    },
    blue:    { bg: 'rgba(0,113,227,0.15)',    fg: 'var(--blue)'   },
    orange:  { bg: 'rgba(255,159,10,0.13)',   fg: '#ff9f0a'       },
  };
  const { bg, fg } = map[color] ?? map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem',
      fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: bg, color: fg
    }}>
      {children}
    </span>
  );
}

/* ─────────── Form Field ─────────── */
function Field({ label, children }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

/* ─────────── Confirm Dialog ─────────── */
function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" variants={modalV} initial="hidden" animate="show" exit="exit"
          style={{ zIndex: 400 }}>
          <motion.div variants={panelV} initial="hidden" animate="show" exit="exit"
            style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', padding: '2rem', maxWidth: 400, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              <div style={{ padding: 10, borderRadius: 14, background: danger ? 'rgba(255,69,58,0.12)' : 'rgba(0,113,227,0.12)', flexShrink: 0 }}>
                <AlertTriangle size={22} color={danger ? 'var(--red)' : 'var(--blue)'} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.025em', marginBottom: 3 }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onCancel} className="apple-button" style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={onConfirm} className="apple-button" style={{ flex: 1, padding: '12px', background: danger ? 'var(--red)' : 'var(--blue)', color: '#fff' }}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────── Stat Card ─────────── */
function StatCard({ icon, label, value, unit, tag, tagColor, glow, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ ...sp, delay }}
      style={{
        background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)', padding: '1.75rem',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: 200
      }}
    >
      {/* ambient glow */}
      <div style={{ position: 'absolute', bottom: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: glow, opacity: 0.18, filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }} title={String(value)}>
          <AnimatedNumber value={value} /><span style={{ color: 'var(--text-3)', fontSize: '1.2rem', fontWeight: 600, marginLeft: 6 }}>{unit}</span>
        </p>
      </div>
      <div style={{ position: 'relative', zIndex: 1, marginTop: '1.25rem' }}>
        <Tag color={tagColor}>{tag}</Tag>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   ANALYTICS VIEW
══════════════════════════════════════════ */
function AnalyticsView({ inventory }) {
  const totalQty    = inventory.reduce((a, c) => a + c.quantity, 0);
  const avgQty      = inventory.length ? Math.round(totalQty / inventory.length) : 0;
  const top5        = [...inventory].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const low5        = [...inventory].filter(i => i.quantity <= 5);
  const maxQty      = Math.max(...inventory.map(i => i.quantity), 1);

  if (inventory.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-2)' }}>
        <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p style={{ fontWeight: 600 }}>No data yet. Add items to see analytics.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total SKUs',    value: inventory.length, unit: 'models', color: 'blue'   },
          { label: 'Total Units',   value: totalQty,         unit: 'units',  color: 'green'  },
          { label: 'Avg. Per SKU',  value: avgQty,           unit: 'units',  color: 'neutral'},
          { label: 'Low Stock',     value: low5.length,      unit: 'items',  color: low5.length > 0 ? 'red' : 'green' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface-3)', borderRadius: 18, padding: '1.1rem 1.25rem', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmt(k.value)}</p>
            <div style={{ marginTop: 8 }}><Tag color={k.color}>{k.unit}</Tag></div>
          </div>
        ))}
      </div>

      {/* Top stock bar chart */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 20, border: '1px solid var(--border)', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1.25rem', fontSize: '1rem' }}>
          Top Stock Levels
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {top5.map((item, i) => {
            const pct = Math.max((item.quantity / maxQty) * 100, 2);
            const colors = ['#0071e3','#30d158','#ff9f0a','#bf5af2','#ff453a'];
            return (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }} title={item.model}>{item.model}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0, marginLeft: 8 }}>{fmt(item.quantity)} units</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-4)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.08, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                    style={{ height: '100%', borderRadius: 99, background: colors[i % colors.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low stock list */}
      {low5.length > 0 && (
        <div style={{ background: 'rgba(255,69,58,0.06)', borderRadius: 20, border: '1px solid rgba(255,69,58,0.2)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <AlertTriangle size={18} color="var(--red)" />
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--red)' }}>Low Stock Alerts ({low5.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {low5.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 12 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.model}>{item.model} · <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>{item.color}</span></span>
                <Tag color="red">{item.quantity} left</Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard({ onLogout, theme, setTheme }) {
  const [inventory, setInventory]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('warehouse'); // 'warehouse' | 'analytics'
  const [isItemModalOpen,        setIsItemModalOpen]        = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isHistoryModalOpen,     setIsHistoryModalOpen]     = useState(false);
  const [deleteTarget,           setDeleteTarget]           = useState(null); // item to delete
  const [editingId,   setEditingId]   = useState(null);
  const [activeItem,  setActiveItem]  = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [itemForm, setItemForm] = useState({ model: '', color: '', description: '', quantity: 0, image: '' });
  const [txForm,   setTxForm]   = useState({
    type: 'IN', quantity: '', partyName: '',
    date: new Date().toISOString().split('T')[0], address: '', billingNumber: ''
  });
  const fileInputRef    = useRef(null);
  const catalogRef      = useRef(null);
  const analyticsRef    = useRef(null);
  const searchRef       = useRef(null);
  const [filter, setFilter] = useState('all');   // 'all' | 'low' | 'ok'
  const [sort,   setSort]   = useState('default'); // 'name-az'|'name-za'|'qty-asc'|'qty-desc'
  const [inlineEdit, setInlineEdit] = useState(null); // { id, val }

  const [loading, setLoading] = useState(true);
  const [activityFeed, setActivityFeed] = useState([]);

  /* ── fetch ── */
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/inventory`);
      if (!res.ok) throw new Error(`${res.status}`);
      setInventory(await res.json());
    } catch {
      toast.error('Cannot reach server. Is it running?');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const fetchActivity = useCallback(async () => {
    try { const r = await fetch(`${API}/transactions`); if (r.ok) setActivityFeed(await r.json()); } catch {}
  }, []);
  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  /* ── nav scroll ── */
  const navTo = (section) => {
    setActiveSection(section);
    if (section === 'warehouse') {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ── delete flow ── */
  const requestDelete = (item) => setDeleteTarget(item);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      const res = await fetch(`${API}/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchInventory(); toast.success('Item deleted'); }
      else toast.error('Delete failed');
    } catch { toast.error('Network error'); }
  };

  /* ── image ── */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setItemForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ── item CRUD ── */
  const openAddItemModal = () => {
    setEditingId(null);
    setItemForm({ model: '', color: '', description: '', quantity: 0, image: '' });
    setIsItemModalOpen(true);
  };
  const openEditModal = (item) => {
    setEditingId(item.id);
    setItemForm({ ...item });
    setIsItemModalOpen(true);
  };
  const saveItem = async (e) => {
    e.preventDefault();
    const payload = { ...itemForm, id: editingId || Date.now().toString(), quantity: Number(itemForm.quantity) };
    try {
      const url    = editingId ? `${API}/inventory/${editingId}` : `${API}/inventory`;
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        fetchInventory(); setIsItemModalOpen(false);
        if (!editingId) { fireConfetti(); toast.success('🎉 Item added!'); }
        else toast.success('Item updated');
      }
      else toast.error('Failed to save item');
    } catch { toast.error('Network error'); }
  };

  /* ── transaction ── */
  const openTransactionModal = (item, type) => {
    setActiveItem(item);
    setTxForm({ type, quantity: '', partyName: '', date: new Date().toISOString().split('T')[0], address: '', billingNumber: '' });
    setIsTransactionModalOpen(true);
  };
  const submitTransaction = async (e) => {
    e.preventDefault();
    if (txForm.type === 'OUT' && Number(txForm.quantity) > activeItem.quantity) {
      toast.error('Cannot dispatch more than current stock');
      return;
    }
    try {
      const res = await fetch(`${API}/inventory/${activeItem.id}/transaction`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(txForm)
      });
      if (res.ok) {
        fetchInventory(); setIsTransactionModalOpen(false);
        toast.success(txForm.type === 'IN' ? '✓ Restock logged' : '✓ Dispatch logged');
      } else {
        const err = await res.json(); toast.error(err.error || 'Transaction failed');
      }
    } catch { toast.error('Network error'); }
  };

  /* ── history ── */
  const openHistoryModal = async (item) => {
    setActiveItem(item);
    try {
      const res  = await fetch(`${API}/inventory/${item.id}/transactions`);
      const data = await res.json();
      setHistoryData(data);
      setIsHistoryModalOpen(true);
    } catch { toast.error('Could not load ledger'); }
  };

  /* ── export CSV ── */
  const exportCSV = useCallback(() => {
    const rows = [['ID','Model','Color','Description','Quantity','SKU'],
      ...inventory.map(i => [i.id,i.model,i.color,i.description,i.quantity,i.sku||''])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `inventory-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success('CSV downloaded');
  }, [inventory]);
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openAddItemModal(); }
      if (e.key === '/' ) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);



  /* ── inline quick-edit quantity ── */
  const submitInlineEdit = async (item) => {
    const newQty = Number(inlineEdit?.val);
    if (isNaN(newQty) || newQty < 0) { setInlineEdit(null); return; }
    const diff = newQty - item.quantity;
    if (diff === 0) { setInlineEdit(null); return; }
    const type = diff > 0 ? 'IN' : 'OUT';
    const qty  = Math.abs(diff);
    if (type === 'OUT' && qty > item.quantity) { toast.error('Not enough stock'); setInlineEdit(null); return; }
    try {
      const res = await fetch(`${API}/inventory/${item.id}/transaction`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity: qty, partyName: 'Quick Edit', date: new Date().toISOString().split('T')[0], address: '-', billingNumber: 'QE-' + Date.now() })
      });
      if (res.ok) { fetchInventory(); toast.success(type === 'IN' ? `+${qty} added` : `−${qty} removed`); }
      else toast.error('Update failed');
    } catch { toast.error('Network error'); }
    setInlineEdit(null);
  };

  /* ── derived ── */
  const maxQty        = useMemo(() => Math.max(...inventory.map(i => i.quantity), 1), [inventory]);
  const totalItems    = inventory.length;
  const totalQuantity = inventory.reduce((a, c) => a + c.quantity, 0);
  const lowStock      = inventory.filter(i => i.quantity <= 5).length;
  const filtered      = useMemo(() => {
    let items = inventory.filter(i =>
      [i.model, i.color, i.description].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filter === 'low') items = items.filter(i => i.quantity <= 5);
    if (filter === 'ok')  items = items.filter(i => i.quantity  > 5);
    if (sort === 'name-az')  items = [...items].sort((a,b) => a.model.localeCompare(b.model));
    if (sort === 'name-za')  items = [...items].sort((a,b) => b.model.localeCompare(a.model));
    if (sort === 'qty-asc')  items = [...items].sort((a,b) => a.quantity - b.quantity);
    if (sort === 'qty-desc') items = [...items].sort((a,b) => b.quantity - a.quantity);
    return items;
  }, [inventory, searchQuery, filter, sort]);

  /* ━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━ */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 44, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'rgba(8,8,10,0.80)',
        backdropFilter: 'saturate(200%) blur(24px)',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box size={16} color="var(--blue)" strokeWidth={2.2} />
          <span style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '-0.03em' }}>Perfect Ergonomics</span>
        </div>

        {/* nav links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            { id: 'warehouse', label: 'Warehouse' },
            { id: 'analytics', label: 'Analytics' },
          ].map(n => (
            <button
              key={n.id}
              onClick={() => navTo(n.id)}
              style={{
                background: activeSection === n.id ? 'rgba(255,255,255,0.1)' : 'none',
                border: 'none', cursor: 'pointer',
                color: activeSection === n.id ? 'var(--text)' : 'var(--text-2)',
                padding: '4px 12px', borderRadius: 8, fontFamily: 'inherit',
                fontSize: '0.82rem', fontWeight: 600, transition: 'all .2s'
              }}
              onMouseEnter={e => { if (activeSection !== n.id) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (activeSection !== n.id) e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* right side: clock + shortcuts + theme + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LiveClock />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>N&nbsp;new</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>/&nbsp;search</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>⌘K&nbsp;palette</span>
          {/* Theme toggle */}
          <button
            onClick={() => setTheme && setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 26, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section
        style={{ paddingTop: '44px', position: 'relative', overflow: 'hidden' }}
        onMouseMove={e => {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          const spotlight = el.querySelector('.hero-spotlight');
          if (spotlight) {
            spotlight.style.left = (e.clientX - rect.left) + 'px';
            spotlight.style.top  = (e.clientY - rect.top)  + 'px';
          }
        }}
      >
        {/* cursor spotlight */}
        <div className="hero-spotlight" style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,158,255,0.14) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2, transition: 'left 0.06s linear, top 0.06s linear', left: '50%', top: '40%' }} />
        {/* animated orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div className="orb-1" style={{ position: 'absolute', top: -120, left: '10%',  width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.28) 0%, transparent 65%)', filter: 'blur(2px)' }} />
          <div className="orb-2" style={{ position: 'absolute', top:   80, right: '8%',  width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,209,88,0.15) 0%, transparent 65%)' }} />
          <div className="orb-3" style={{ position: 'absolute', bottom:-60, left:  '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,0.12) 0%, transparent 65%)' }} />
          {/* dot-grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* noise grain */}
          <div className="hero-noise" style={{ position: 'absolute', inset: 0, opacity: 0.06 }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Tag color="blue"><Activity size={10} /> Inventory Pro</Tag>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ...sp }}
            style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.95, margin: '1.25rem 0 1rem' }}
          >
            Built for the<br />
            <span style={{ background: 'linear-gradient(120deg, #3b9eff 0%, #00d4ff 45%, #30d158 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              warehouse floor.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'var(--text-2)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '2rem', lineHeight: 1.5 }}
          >
            Real-time stock. Beautiful ledger. Zero friction.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={openAddItemModal} className="apple-button primary" style={{ fontSize: '0.95rem', padding: '13px 26px' }}>
              <Plus size={17} /> Add Item
            </button>
            <button onClick={() => navTo('analytics')} className="apple-button" style={{ fontSize: '0.95rem', padding: '13px 26px' }}>
              <BarChart3 size={17} /> View Analytics
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS BENTO ══ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 1.25rem 4rem' }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.045em', marginBottom: '1.25rem' }}
        >
          Get the highlights.
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <StatCard icon={<BarChart3 size={22} color="var(--blue)" />}   label="Floor Capacity"   value={totalQuantity} unit="units"  tag="Total Stock"   tagColor="blue"    glow="linear-gradient(135deg,#0071e3,#00b4d8)" delay={0}    />
          <StatCard icon={<Layers size={22}    color="var(--green)" />}   label="Catalog Breadth"  value={totalItems}    unit="SKUs"   tag="Unique Models"  tagColor="green"   glow="linear-gradient(135deg,#30d158,#34c759)" delay={0.06} />
          <StatCard icon={<Activity size={22}  color={lowStock > 0 ? 'var(--red)' : 'var(--green)'} />} label="Low Stock Items" value={lowStock} unit="alerts" tag={lowStock > 0 ? 'Action Needed' : 'All Clear'} tagColor={lowStock > 0 ? 'red' : 'green'} glow="linear-gradient(135deg,#ff453a,#ff9f0a)" delay={0.12} />
        </div>
      </section>

      {/* ══ ANALYTICS ══ */}
      <section ref={analyticsRef} id="analytics" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 1.25rem 5rem', scrollMarginTop: 60 }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.045em', marginBottom: '1.25rem' }}
        >
          Analytics.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', padding: '1.75rem' }}
        >
          <AnalyticsView inventory={inventory} />
        </motion.div>
      </section>

      {/* ══ SEARCH ══ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 1.25rem 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-2)', borderRadius: 20, border: '1px solid var(--border)', padding: '14px 18px', transition: 'border-color .2s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Search size={19} color="var(--text-3)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            ref={searchRef}
            placeholder="Search models, colors, descriptions…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.95rem', letterSpacing: '-0.01em' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'var(--surface-3)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={15} />
            </button>
          )}
        </motion.div>

        {/* ── Filter / Sort / Export row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {[['all','All Items'],['ok','✓ In Stock'],['low','⚠ Low Stock']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, transition: 'all .2s',
                background: filter === val ? (val === 'low' ? 'rgba(255,69,58,0.2)' : val === 'ok' ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.05)',
                color: filter === val ? (val === 'low' ? 'var(--red)' : val === 'ok' ? 'var(--green)' : 'var(--text)') : 'var(--text-3)' }}
            >{label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-3)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
            <option value="default">Sort: Default</option>
            <option value="name-az">Name A→Z</option>
            <option value="name-za">Name Z→A</option>
            <option value="qty-desc">Stock: High→Low</option>
            <option value="qty-asc">Stock: Low→High</option>
          </select>
          <button onClick={exportCSV} className="apple-button" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 6 }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </section>

      {/* ══ CATALOG ══ */}
      <section ref={catalogRef} id="warehouse" style={{ maxWidth: 1320, margin: '0 auto', padding: '0 1.25rem 6rem', scrollMarginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.045em' }}>
            <WordReveal text="Take a closer look." />
          </h2>
          <button onClick={openAddItemModal} className="apple-button primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <Plus size={15} /> New Item
          </button>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', padding: '4rem 2rem', textAlign: 'center' }}>
            <Package size={52} color="var(--text-3)" style={{ marginBottom: '1.25rem', opacity: 0.35 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {searchQuery ? 'No results found.' : 'Catalog is empty.'}
            </h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {searchQuery ? `Nothing matched "${searchQuery}".` : 'Add your first item to get started.'}
            </p>
            {!searchQuery && (
              <button onClick={openAddItemModal} className="apple-button primary">
                <Plus size={15} /> Add First Item
              </button>
            )}
          </motion.div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))', gap: 14 }}>
            {filtered.map((item, idx) => {
              const isLow = item.quantity <= 5;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...sp, delay: idx * 0.06 }}
                >
                <TiltCard
                  key={item.id}
                  className={isLow ? 'card-low-pulse' : ''}
                  style={{
                    background: 'var(--surface-2)', borderRadius: 'var(--radius-card)',
                    border: `1px solid ${isLow ? 'rgba(255,69,58,0.3)' : 'var(--border)'}`,
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: isLow ? '0 4px 24px rgba(255,69,58,0.1)' : '0 4px 24px rgba(0,0,0,0.12)',
                  }}
                >
                  {/* ── image ── */}
                  <div style={{ position: 'relative', width: '100%', paddingTop: '60%', background: 'var(--surface)', flexShrink: 0 }}>
                    {item.image ? (
                      <motion.img
                        src={item.image} alt={item.model}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={36} color="var(--text-3)" opacity={0.3} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,18,20,0.95) 0%, rgba(18,18,20,0.3) 45%, transparent 75%)' }} />

                    {isLow && (
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <Tag color="red"><AlertTriangle size={9} /> Low</Tag>
                      </div>
                    )}

                    {/* name overlay */}
                    <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }} title={item.model}>{item.model}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.color}>{item.color}</p>
                    </div>
                  </div>

                  {/* ── body ── */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.55,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      minHeight: '2.55rem'
                    }}>
                      {item.description || <em style={{ color: 'var(--text-3)' }}>No description.</em>}
                    </p>

                    {/* SKU badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--surface-3)', padding: '3px 9px', borderRadius: 99, border: '1px solid var(--border)' }}>
                        SKU: {item.sku || item.id?.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* stock strip + progress bar */}
                    <div style={{ background: 'var(--surface-3)', borderRadius: 12, padding: '9px 13px', border: isLow ? '1px solid rgba(255,69,58,0.2)' : '1px solid transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>In Stock</span>
                        {inlineEdit?.id === item.id ? (
                          <input
                            type="number" min="0" autoFocus
                            value={inlineEdit.val}
                            onChange={e => setInlineEdit({ id: item.id, val: e.target.value })}
                            onBlur={() => submitInlineEdit(item)}
                            onKeyDown={e => { if (e.key === 'Enter') submitInlineEdit(item); if (e.key === 'Escape') setInlineEdit(null); }}
                            style={{ width: 72, textAlign: 'right', background: 'var(--surface-4)', border: '1.5px solid var(--border-focus)', borderRadius: 8, color: 'var(--text)', fontSize: '1.1rem', fontWeight: 900, fontFamily: 'inherit', padding: '2px 6px', outline: 'none' }}
                          />
                        ) : (
                          <span
                            onClick={() => setInlineEdit({ id: item.id, val: String(item.quantity) })}
                            title="Click to quick-edit"
                            style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.03em', color: isLow ? 'var(--red)' : 'var(--text)', cursor: 'text', borderRadius: 6, padding: '0 4px', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >{fmt(item.quantity)}</span>
                        )}
                      </div>
                      {/* progress bar */}
                      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max((item.quantity / maxQty) * 100, item.quantity > 0 ? 3 : 0)}%` }}
                          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                          style={{ height: '100%', borderRadius: 99,
                            background: item.quantity === 0 ? 'var(--red)' : item.quantity <= 5 ? 'linear-gradient(90deg,#ff9f0a,#ff453a)' : item.quantity <= 15 ? '#ff9f0a' : 'var(--green)'
                          }}
                        />
                      </div>
                    </div>

                    {/* actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button onClick={() => openTransactionModal(item, 'IN')} className="apple-button success" style={{ borderRadius: 12, padding: '9px 8px', fontSize: '0.78rem' }}>
                        <ArrowDownToLine size={13} /> Restock
                      </button>
                      <button onClick={() => openTransactionModal(item, 'OUT')} className="apple-button danger" style={{ borderRadius: 12, padding: '9px 8px', fontSize: '0.78rem' }}>
                        <ArrowUpFromLine size={13} /> Dispatch
                      </button>
                      <button onClick={() => openHistoryModal(item)} className="apple-button" style={{ gridColumn: '1/-1', borderRadius: 12, padding: '9px', fontSize: '0.78rem' }}>
                        <History size={13} /> View Ledger
                      </button>
                    </div>

                    {/* footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
                      <button
                        onClick={() => openEditModal(item)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', fontWeight:600, fontFamily:'inherit', padding:'3px 0', transition:'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => requestDelete(item)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', fontWeight:600, fontFamily:'inherit', padding:'3px 0', transition:'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </TiltCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>


      {/* ══════ MODALS ══════ */}
      <AnimatePresence>

        {/* ── ADD / EDIT ITEM ── */}
        {isItemModalOpen && (
          <motion.div className="modal-overlay" variants={modalV} initial="hidden" animate="show" exit="exit"
            onClick={e => e.target === e.currentTarget && setIsItemModalOpen(false)}>
            <motion.div className="modal-content" style={{ maxWidth: 520, padding: '2rem' }} variants={panelV} initial="hidden" animate="show" exit="exit">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.75rem' }}>
                <h2 style={{ fontSize:'1.5rem', fontWeight:900, letterSpacing:'-0.04em' }}>
                  {editingId ? 'Edit Item' : 'Add to Catalog'}
                </h2>
                <button onClick={() => setIsItemModalOpen(false)} style={{ background:'var(--surface-3)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={saveItem} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <Field label="Model Name">
                  <input required className="apple-input" value={itemForm.model} onChange={e => setItemForm({...itemForm, model: e.target.value})} placeholder="e.g. ErgoChair Pro" />
                </Field>
                <Field label="Color / Finish">
                  <input required className="apple-input" value={itemForm.color} onChange={e => setItemForm({...itemForm, color: e.target.value})} placeholder="e.g. Midnight Black" />
                </Field>
                <Field label="Description">
                  <textarea required rows={3} className="apple-input" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} placeholder="Brief product description…" style={{ resize:'none' }} />
                </Field>
                {!editingId && (
                  <Field label="Initial Quantity">
                    <input type="number" min="0" required className="apple-input" value={itemForm.quantity} onChange={e => setItemForm({...itemForm, quantity: e.target.value})} />
                  </Field>
                )}
                <Field label="Product Image">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display:'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    style={{ width:'100%', padding:'1.5rem', background:'var(--surface-3)', border:'1.5px dashed var(--border)', borderRadius:14, cursor:'pointer', color: itemForm.image ? 'var(--text)' : 'var(--text-3)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'border-color .2s, background .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-focus)'; e.currentTarget.style.background='var(--surface-4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface-3)'; }}
                  >
                    {itemForm.image ? <CheckCircle2 size={26} color="var(--green)" /> : <ImageIcon size={26} />}
                    <span style={{ fontSize:'0.82rem', fontWeight:600 }}>
                      {itemForm.image ? 'Image set — click to replace' : 'Upload product image'}
                    </span>
                  </button>
                </Field>
                <div style={{ display:'flex', gap:10, marginTop:'0.5rem' }}>
                  <button type="button" onClick={() => setIsItemModalOpen(false)} className="apple-button" style={{ flex:1, padding:14 }}>Cancel</button>
                  <button type="submit" className="apple-button primary" style={{ flex:1, padding:14 }}>
                    {editingId ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ── TRANSACTION ── */}
        {isTransactionModalOpen && activeItem && (
          <motion.div className="modal-overlay" variants={modalV} initial="hidden" animate="show" exit="exit"
            onClick={e => e.target === e.currentTarget && setIsTransactionModalOpen(false)}>
            <motion.div className="modal-content" style={{ maxWidth:480, padding:'2rem' }} variants={panelV} initial="hidden" animate="show" exit="exit">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div>
                  <h2 style={{ fontSize:'1.4rem', fontWeight:900, letterSpacing:'-0.04em', marginBottom:3 }}>
                    {txForm.type === 'IN' ? 'Log Restock' : 'Log Dispatch'}
                  </h2>
                  <p style={{ fontSize:'0.82rem', color:'var(--text-2)' }}>{activeItem.model} · {activeItem.color}</p>
                </div>
                <Tag color={txForm.type === 'IN' ? 'green' : 'red'}>{txForm.type === 'IN' ? 'Incoming' : 'Outgoing'}</Tag>
              </div>

              {/* current stock callout */}
              <div style={{ background:'var(--surface-3)', borderRadius:14, padding:'13px 18px', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-2)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Current Stock</span>
                <span style={{ fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.04em' }}>{fmt(activeItem.quantity)}</span>
              </div>

              <form onSubmit={submitTransaction} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Field label={txForm.type === 'IN' ? 'Qty In' : 'Qty Out'}>
                    <input type="number" min="1" max={txForm.type==='OUT' ? activeItem.quantity : undefined} required className="apple-input" value={txForm.quantity} onChange={e => setTxForm({...txForm, quantity: e.target.value})} />
                  </Field>
                  <Field label="Date">
                    <input type="date" required className="apple-input" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                  </Field>
                </div>
                <Field label={txForm.type === 'IN' ? 'Supplier Name' : 'Customer Name'}>
                  <input required className="apple-input" value={txForm.partyName} onChange={e => setTxForm({...txForm, partyName: e.target.value})} placeholder="Full name or company" />
                </Field>
                <Field label="Invoice / Billing No.">
                  <input required className="apple-input" value={txForm.billingNumber} onChange={e => setTxForm({...txForm, billingNumber: e.target.value})} placeholder="INV-2024-XXXX" />
                </Field>
                <Field label="Delivery / Pickup Address">
                  <textarea rows={2} required className="apple-input" value={txForm.address} onChange={e => setTxForm({...txForm, address: e.target.value})} style={{ resize:'none' }} placeholder="Street, City, State" />
                </Field>
                <div style={{ display:'flex', gap:10, marginTop:'0.5rem' }}>
                  <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="apple-button" style={{ flex:1, padding:14 }}>Cancel</button>
                  <button type="submit" className="apple-button" style={{ flex:1, padding:14, background: txForm.type==='IN' ? 'var(--green)' : 'var(--red)', color: txForm.type==='IN' ? '#000' : '#fff', fontWeight:700 }}>
                    {txForm.type === 'IN' ? '↓ Confirm Restock' : '↑ Confirm Dispatch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ── HISTORY / LEDGER ── */}
        {isHistoryModalOpen && activeItem && (
          <motion.div className="modal-overlay" variants={modalV} initial="hidden" animate="show" exit="exit"
            onClick={e => e.target === e.currentTarget && setIsHistoryModalOpen(false)}>
            <motion.div className="modal-content" style={{ maxWidth:660, padding:'2rem' }} variants={panelV} initial="hidden" animate="show" exit="exit">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:900, letterSpacing:'-0.04em', marginBottom:3 }}>Transaction Ledger</h2>
                  <p style={{ color:'var(--text-2)', fontWeight:500, fontSize:'0.85rem' }}>{activeItem.model} · {activeItem.color}</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} style={{ background:'var(--surface-3)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <X size={15} />
                </button>
              </div>

              {historyData.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3.5rem', background:'var(--surface-2)', borderRadius:18 }}>
                  <History size={40} color="var(--text-3)" style={{ marginBottom:'1rem', opacity:0.35 }} />
                  <p style={{ color:'var(--text-2)', fontWeight:600 }}>No transactions recorded yet.</p>
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show"
                  style={{ maxHeight:'64vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:8, paddingRight:2 }}>
                  {historyData.map(tx => (
                    <motion.div key={tx.id} variants={fadeUp}
                      style={{ background:'var(--surface-2)', borderRadius:18, border:'1px solid var(--border)', padding:'1rem 1.2rem', display:'flex', gap:'1rem', alignItems:'center' }}>
                      {/* amount pill */}
                      <div style={{ flexShrink:0, minWidth:76, padding:'10px 12px', borderRadius:14, background: tx.type==='IN' ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', textAlign:'center' }}>
                        <div style={{ fontSize:'1.2rem', fontWeight:900, color: tx.type==='IN' ? 'var(--green)' : 'var(--red)', letterSpacing:'-0.03em', whiteSpace:'nowrap' }}>
                          {tx.type==='IN' ? '+' : '−'}{fmt(tx.quantity)}
                        </div>
                        <div style={{ fontSize:'0.62rem', fontWeight:800, color: tx.type==='IN' ? 'var(--green)' : 'var(--red)', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:2 }}>
                          {tx.type === 'IN' ? 'IN' : 'OUT'}
                        </div>
                      </div>
                      {/* details */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5, gap:8 }}>
                          <h4 style={{ fontWeight:700, fontSize:'0.9rem', letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={tx.partyName}>
                            {tx.partyName}
                          </h4>
                          <span style={{ flexShrink:0, fontSize:'0.75rem', color:'var(--text-3)', fontVariantNumeric:'tabular-nums' }}>
                            {fmtD(tx.date)}
                          </span>
                        </div>
                        <p style={{ fontSize:'0.78rem', color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          <span style={{ color:'var(--text-3)' }}>INV</span> {tx.billingNumber}
                          <span style={{ color:'var(--text-3)', margin:'0 5px' }}>·</span>
                          {tx.address}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Item"
        message={deleteTarget ? `"${deleteTarget.model}" and all its transaction history will be permanently removed.` : ''}
        confirmLabel="Delete Permanently"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── COMMAND PALETTE ── */}
      <CommandPalette
        inventory={inventory}
        onAddItem={openAddItemModal}
        onExportCSV={exportCSV}
        theme={theme}
        onSetTheme={setTheme}
        onNavTo={navTo}
      />

    </div>
  );
}
