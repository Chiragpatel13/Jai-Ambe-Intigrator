import mongoose from 'mongoose';

async function listUnsplash() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const prods = await mongoose.connection.db.collection('products').find({
    images: { $regex: 'unsplash.com' }
  }).toArray();

  console.log(`Found ${prods.length} products with unsplash images:\n`);
  prods.forEach((p, i) => {
    console.log(`${i + 1}. [${p._id}] "${p.name}"`);
  });

  await mongoose.disconnect();
}

listUnsplash();
