import fs from 'fs';
import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const rawData = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/823f54f3-9e06-4044-8663-11860b82b683/scratch/used_products_final.json', 'utf8');
const usedProducts = JSON.parse(rawData);

async function insertUsed() {
  console.log(`Starting insertion of ${usedProducts.length} USED products...`);

  // 1. MongoDB Connection
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;
  console.log('Connected to MongoDB.');

  const mongoCategories = await mongoDb.collection('categories').find({}).toArray();
  const categoryMapMongo = {};
  mongoCategories.forEach(c => {
    categoryMapMongo[c.slug] = c._id;
  });

  // 2. Firestore Categories
  const firestoreCategorySnap = await getDocs(collection(db, 'categories'));
  const categoryMapFirestore = {};
  firestoreCategorySnap.forEach(docSnap => {
    const data = docSnap.data();
    categoryMapFirestore[data.slug] = docSnap.id;
  });

  let mongoInserted = 0;
  let firestoreInserted = 0;

  for (const p of usedProducts) {
    const mongoCatId = categoryMapMongo[p.categorySlug] || mongoCategories[0]._id;
    const firestoreCatId = categoryMapFirestore[p.categorySlug] || Object.values(categoryMapFirestore)[0];

    // Clean name & desc
    const cleanName = p.name.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const cleanDesc = p.description.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    // ── Insert into MongoDB ──
    const mongoDoc = {
      name: cleanName,
      price: p.price,
      condition: 'used',
      description: cleanDesc,
      images: p.images,
      category: mongoCatId,
      stock: p.stock || 2,
      availability: true,
      featured: false,
      brand: p.brand,
      warranty: '3 Months Shop Warranty',
      location: 'Boisar',
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    };

    const existingMongo = await mongoDb.collection('products').findOne({ name: cleanName });
    if (!existingMongo) {
      await mongoDb.collection('products').insertOne(mongoDoc);
      mongoInserted++;
      console.log(`[MongoDB] Added Used: ${cleanName.substring(0, 45)}... (₹${p.price})`);
    } else {
      console.log(`[MongoDB] Already exists: ${cleanName.substring(0, 45)}...`);
    }

    // ── Insert into Firestore ──
    try {
      const firestoreDoc = {
        name: cleanName,
        price: p.price,
        condition: 'used',
        description: cleanDesc,
        images: p.images,
        categoryId: firestoreCatId,
        stock: p.stock || 2,
        availability: true,
        featured: false,
        brand: p.brand,
        warranty: '3 Months Shop Warranty',
        location: 'Boisar',
        reviews: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'products'), firestoreDoc);
      firestoreInserted++;
      console.log(`[Firestore] Added Used: ${cleanName.substring(0, 45)}...`);
    } catch (fErr) {
      console.warn(`[Firestore] Error on ${cleanName.substring(0, 30)}:`, fErr.message);
    }
  }

  const totalMongo = await mongoDb.collection('products').countDocuments();
  console.log(`\n🎉 Insertion Finished!`);
  console.log(`MongoDB newly added used products: ${mongoInserted} | Total MongoDB products now: ${totalMongo}`);
  console.log(`Firestore newly added used products: ${firestoreInserted}`);

  process.exit(0);
}

insertUsed().catch(err => {
  console.error('Fatal error during used insert:', err);
  process.exit(1);
});
