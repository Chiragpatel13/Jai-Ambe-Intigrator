import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let seeded = false;

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside environment settings.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB Connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Auto-seed the database in the background on the first connection
    if (!seeded) {
      seeded = true;
      import('./seed')
        .then(({ seedDatabase }) => seedDatabase())
        .catch((err) => console.error('Auto-seeding failed:', err));
    }
  } catch (e) {
    cached.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
