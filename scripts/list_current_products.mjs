import mongoose from 'mongoose';

async function list() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const prods = await mongoose.connection.db.collection('products').find({}, { projection: { name: 1, category: 1, condition: 1, images: 1 } }).toArray();
  console.log('Total MongoDB products:', prods.length);
  const names = new Set();
  prods.forEach((p, idx) => {
    names.add(p.name);
    console.log(`${idx + 1}. [${p.condition}] [${p.category}] ${p.name}`);
  });
  await mongoose.disconnect();
}
list();
