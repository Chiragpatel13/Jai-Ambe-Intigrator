import mongoose from 'mongoose';

async function listOther() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const prods = await mongoose.connection.db.collection('products').find({
    images: { $not: { $regex: 'unsplash.com' } }
  }).toArray();

  console.log(`Found ${prods.length} products WITHOUT unsplash:\n`);
  prods.forEach((p, i) => {
    console.log(`${i + 1}. [${p._id}] "${p.name}"`);
    console.log(`   Img: ${p.images?.[0]}`);
  });

  await mongoose.disconnect();
}

listOther();
