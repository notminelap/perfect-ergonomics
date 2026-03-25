import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Force Google DNS — fixes ISP/container SRV-record resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── MongoDB Connection ─────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perfect-ergonomics';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

// ── Schemas ────────────────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  id:            String,
  itemId:        String,
  type:          String,
  quantity:      Number,
  partyName:     String,
  date:          String,
  address:       String,
  billingNumber: String,
  timestamp:     String,
});

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
}, { strict: false, _id: false });

const Transaction = mongoose.model('Transaction', transactionSchema);
const Item        = mongoose.model('Item', itemSchema);

// ── Helper ─────────────────────────────────────────────────────────────
const lean = doc => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
};

// ── REST Endpoints ─────────────────────────────────────────────────────
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Item.find({}).lean();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(lean(item));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(lean(item));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await Item.deleteOne({ id: req.params.id });
    await Transaction.deleteMany({ itemId: req.params.id });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Transaction Endpoints ──────────────────────────────────────────────
app.get('/api/inventory/:id/transactions', async (req, res) => {
  try {
    const txs = await Transaction.find({ itemId: req.params.id })
      .sort({ timestamp: -1 })
      .lean();
    res.json(txs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory/:id/transaction', async (req, res) => {
  try {
    const { type, quantity, partyName, date, address, billingNumber } = req.body;
    const numQty = Number(quantity);

    // Check stock for OUT transactions
    if (type === 'OUT') {
      const current = await Item.findOne({ id: req.params.id }).lean();
      if (!current) return res.status(404).json({ error: 'Item not found' });
      if ((current.quantity || 0) < numQty) {
        return res.status(400).json({ error: 'Insufficient stock to fulfill transaction' });
      }
    }

    // Use $inc to atomically update quantity — avoids _id:false save() issue
    const delta = type === 'IN' ? numQty : -numQty;
    const updatedItem = await Item.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { quantity: delta } },
      { new: true }
    ).lean();
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });

    const tx = new Transaction({
      id:            Date.now().toString() + Math.floor(Math.random() * 1000),
      itemId:        req.params.id,
      type,
      quantity:      numQty,
      partyName,
      date,
      address,
      billingNumber,
      timestamp:     new Date().toISOString(),
    });
    await tx.save();

    res.status(201).json({ item: updatedItem, transaction: lean(tx) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── All transactions (activity feed) ── */
app.get('/api/transactions', async (req, res) => {
  try {
    const txs = await Transaction.find({}).sort({ timestamp: -1 }).limit(30).lean();
    const itemIds = [...new Set(txs.map(t => t.itemId))];
    const items   = await Item.find({ id: { $in: itemIds } }).lean();
    const map     = Object.fromEntries(items.map(i => [i.id, i]));
    res.json(txs.map(tx => ({
      ...tx,
      itemModel: map[tx.itemId]?.model,
      itemColor: map[tx.itemId]?.color,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Serve built frontend (production) ─────────────────────────────────
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (req, res) => res.sendFile(join(distPath, 'index.html')));

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Warehouse server running on port ${PORT}`);
});

