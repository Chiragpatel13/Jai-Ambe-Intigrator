import mongoose from 'mongoose';

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const prods = await mongoose.connection.db.collection('products').find({}).toArray();
  console.log(`Auditing ${prods.length} products...`);

  const unsplashProds = [];
  const amazonProds = [];

  for (const p of prods) {
    const hasUnsplash = p.images?.some(img => img.includes('unsplash.com'));
    if (hasUnsplash) {
      unsplashProds.push({
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        images: p.images
      });
    } else {
      amazonProds.push({
        id: p._id.toString(),
        name: p.name,
        images: p.images
      });
    }
  }

  console.log(`Products with Unsplash images: ${unsplashProds.length}`);
  console.log(`Products with only Amazon / other images: ${amazonProds.length}`);

  console.log('\n--- Unsplash Products ---');
  unsplashProds.forEach((p, i) => {
    console.log(`${i + 1}. [${p.id}] ${p.name}`);
    console.log(`   Images:`, p.images);
  });

  await mongoose.disconnect();
}

audit();
