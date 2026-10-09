// ─── StayScout server · MongoDB connection ──────────────────────────
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Guard: workspace env injects PORT=0 — never let that pick the port
const PORT = Number(process.env.PORT) > 1024 ? Number(process.env.PORT) : 5001;
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'stayscout';

const client = new MongoClient(MONGO_URL);
let db = null;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[db] connected → ${MONGO_URL} / ${DB_NAME}`);
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not connected');
  return db;
}

export { PORT };
