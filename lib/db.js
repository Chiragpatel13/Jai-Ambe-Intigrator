import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailedAt: 0 };
}

let seeded = false;
const RETRY_COOLDOWN_MS = 15000; // Wait 15s after a connection failure before retrying

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside environment settings.');
  }

  // If running in production or on Vercel with a localhost URI, fail immediately without blocking
  if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost'))) {
    throw new Error('Localhost MongoDB is not reachable in production.');
  }

  // If connection recently failed, fail fast to allow Firestore fallback without blocking requests
  if (cached.lastFailedAt && Date.now() - cached.lastFailedAt < RETRY_COOLDOWN_MS) {
    throw new Error('MongoDB connection is temporarily in cooldown after a recent failure.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB Connected successfully');
      cached.lastFailedAt = 0;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;

    // Auto-seed the database in the background on the first connection
    if (!seeded) {
      seeded = true;
      import('./seed.js')
        .then(({ seedDatabase }) => seedDatabase())
        .catch((err) => console.error('Auto-seeding failed:', err));
    }
  } catch (e) {
    cached.promise = null;
    cached.lastFailedAt = Date.now();
    console.error('Error connecting to MongoDB:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
