import fs from 'fs';
import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const rawData = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/823f54f3-9e06-4044-8663-11860b82b683/scratch/amazon_ready_products.json', 'utf8');
const productsToAdd = JSON.parse(rawData);

async function insertAll() {
  console.log(`Starting insertion of ${productsToAdd.length} products...`);

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

  for (const p of productsToAdd) {
    const mongoCatId = categoryMapMongo[p.categorySlug] || mongoCategories[0]._id;
    const firestoreCatId = categoryMapFirestore[p.categorySlug] || Object.values(categoryMapFirestore)[0];

    // Clean name: replace HTML entities
    const cleanName = p.name.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const cleanDesc = p.description.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

    // ── Insert into MongoDB ──
    const mongoDoc = {
      name: cleanName,
      price: p.price,
      condition: p.condition,
      description: cleanDesc,
      images: p.images,
      category: mongoCatId,
      stock: p.stock,
      availability: p.availability,
      featured: p.featured,
      brand: p.brand,
      warranty: p.warranty,
      location: p.location,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    };

    // Check if product with same name already exists in MongoDB
    const existingMongo = await mongoDb.collection('products').findOne({ name: cleanName });
    if (!existingMongo) {
      await mongoDb.collection('products').insertOne(mongoDoc);
      mongoInserted++;
      console.log(`[MongoDB] Added: ${cleanName.substring(0, 40)}... (₹${p.price})`);
    } else {
      console.log(`[MongoDB] Already exists: ${cleanName.substring(0, 40)}...`);
    }

    // ── Insert into Firestore ──
    try {
      const firestoreDoc = {
        name: cleanName,
        price: p.price,
        condition: p.condition,
        description: cleanDesc,
        images: p.images,
        categoryId: firestoreCatId,
        stock: p.stock,
        availability: p.availability,
        featured: p.featured,
        brand: p.brand,
        warranty: p.warranty,
        location: p.location,
        reviews: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'products'), firestoreDoc);
      firestoreInserted++;
      console.log(`[Firestore] Added: ${cleanName.substring(0, 40)}...`);
    } catch (fErr) {
      console.warn(`[Firestore] Warning on ${cleanName.substring(0, 30)}:`, fErr.message);
    }
  }

  const totalMongo = await mongoDb.collection('products').countDocuments();
  console.log(`\n🎉 Insertion Finished!`);
  console.log(`MongoDB newly added: ${mongoInserted} | Total MongoDB products now: ${totalMongo}`);
  console.log(`Firestore newly added: ${firestoreInserted}`);

  process.exit(0);
}

insertAll().catch(err => {
  console.error('Fatal error during insert:', err);
  process.exit(1);
});
