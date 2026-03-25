/**
 * migrate.js — One-time script to import database.json → MongoDB Atlas
 *
 * Usage:
 *   1. Add MONGODB_URI to your .env (or export it in your terminal)
 *   2. node migrate.js
 */

import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

// Force Google DNS to fix ISP SRV-record resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI environment variable is not set.');
  console.error('    Run: $env:MONGODB_URI="mongodb+srv://..." in PowerShell, then re-run this script.');
  process.exit(1);
}

// ── Schemas (same as server.js) ────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  id: String, itemId: String, type: String, quantity: Number,
  partyName: String, date: String, address: String,
  billingNumber: String, timestamp: String,
}, { _id: false });

const itemSchema = new mongoose.Schema(
  { id: { type: String, required: true, unique: true } },
  { strict: false, _id: false }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
const Item        = mongoose.model('Item', itemSchema);

async function migrate() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  const raw  = await fs.readFile(join(__dirname, 'database.json'), 'utf8');
  let   data = JSON.parse(raw);

  // Support old format (array) or new format ({items, transactions})
  if (Array.isArray(data)) data = { items: data, transactions: [] };

  const { items = [], transactions = [] } = data;
  console.log(`📦 Found ${items.length} items and ${transactions.length} transactions.`);

  if (items.length) {
    const ops = items.map(item => ({
      updateOne: {
        filter:  { id: item.id },
        update:  { $set: item },
        upsert:  true,
      },
    }));
    const result = await Item.bulkWrite(ops);
    console.log(`✅ Items: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`);
  }

  if (transactions.length) {
    const ops = transactions.map(tx => ({
      updateOne: {
        filter:  { id: tx.id },
        update:  { $set: tx },
        upsert:  true,
      },
    }));
    const result = await Transaction.bulkWrite(ops);
    console.log(`✅ Transactions: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`);
  }

  await mongoose.disconnect();
  console.log('🎉 Migration complete!');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
