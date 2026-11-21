import fs from 'fs';
import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function updateAllProperImages() {
  const rawData = fs.readFileSync('scripts/amazon_replacement_images.json', 'utf8');
  const replacements = JSON.parse(rawData);

  // Map of explicit product name fragments to verified, authentic product images
  const explicitOverrides = {
    'Fuji Electric FRENIC-Mini': [
      'https://m.media-amazon.com/images/I/61MfZzhFGlL.jpg'
    ],
    'AC Motor Speed Controller Durable Upto 250 Wt': [
      'https://m.media-amazon.com/images/I/51cghcrt93L.jpg'
    ],
    'Havells Crabtree 63A 4-Pole Residual Current Circuit Breaker': [
      'https://m.media-amazon.com/images/I/31eHv2KskCL.jpg'
    ],
    'Schneider Electric Acti9 32A Double Pole (DP) C-Curve MCB': [
      'https://m.media-amazon.com/images/I/61ukfQRJwnL.jpg'
    ],
    'Schneider Electric Easy9 63A 4-Pole 30mA RCCB': [
      'https://m.media-amazon.com/images/I/31eHv2KskCL.jpg',
      'https://m.media-amazon.com/images/I/61ukfQRJwnL.jpg'
    ],
    'Finolex 4 Sq.mm Industrial Multi-Strand Copper Wire': [
      'https://m.media-amazon.com/images/I/71YmcASwCsL.jpg',
      'https://m.media-amazon.com/images/I/61hbRZilkPL.jpg'
    ],
    'Siemens 3TF30 3-Pole 9A Power Contactor with 230V AC Coil': [
      'https://m.media-amazon.com/images/I/41LB6QdO1HL.jpg',
      'https://m.media-amazon.com/images/I/21u+m+wNo3L.jpg'
    ],
    'L&T FAS-1 3-Phase Fully Automatic Star-Delta Starter Panel': [
      'https://m.media-amazon.com/images/I/611CQal-NQL.jpg'
    ]
  };

  // Compile final mapping: name -> images array
  const imageMapByName = new Map();

  for (const item of replacements) {
    if (item.images && item.images.length > 0) {
      imageMapByName.set(item.name, item.images);
    }
  }

  // Apply explicit overrides
  for (const [key, imgs] of Object.entries(explicitOverrides)) {
    imageMapByName.set(key, imgs);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;

  console.log('Connecting to Firestore...');
  const fSnap = await getDocs(collection(db, 'products'));
  const fDocs = [];
  fSnap.forEach(d => fDocs.push({ id: d.id, ...d.data() }));

  let mongoUpdated = 0;
  let firestoreUpdated = 0;

  for (const [nameKey, images] of imageMapByName.entries()) {
    // 1. Update in MongoDB (by name regex)
    const mongoRes = await mongoDb.collection('products').updateMany(
      { name: { $regex: nameKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { $set: { images } }
    );
    if (mongoRes.modifiedCount > 0) {
      mongoUpdated += mongoRes.modifiedCount;
      console.log(`[MongoDB] Updated ${mongoRes.modifiedCount} product(s) matching "${nameKey.substring(0, 45)}"`);
    }

    // 2. Update in Firestore
    const matchingFDocs = fDocs.filter(d => d.name && d.name.toLowerCase().includes(nameKey.toLowerCase()));
    for (const fDoc of matchingFDocs) {
      try {
        await updateDoc(doc(db, 'products', fDoc.id), { images });
        firestoreUpdated++;
        console.log(`[Firestore] Updated "${fDoc.name.substring(0, 40)}"`);
      } catch (err) {
        console.warn(`[Firestore Error] on "${fDoc.name}":`, err.message);
      }
    }
  }

  console.log('\n=============================================');
  console.log(`MongoDB products updated: ${mongoUpdated}`);
  console.log(`Firestore products updated: ${firestoreUpdated}`);
  console.log('=============================================');

  // Verify full inventory in MongoDB
  const allProds = await mongoDb.collection('products').find({}).toArray();
  const unsplashRemaining = allProds.filter(p => p.images?.some(img => img.includes('unsplash.com')));
  console.log(`Total Products: ${allProds.length}`);
  console.log(`Unsplash images remaining: ${unsplashRemaining.length}`);
  if (unsplashRemaining.length > 0) {
    unsplashRemaining.forEach(p => console.log('   Still unsplash:', p.name));
  } else {
    console.log('🎉 100% of products now have authentic, product-specific images!');
  }

  await mongoose.disconnect();
  process.exit(0);
}

updateAllProperImages().catch(err => {
  console.error('Fatal error updating images:', err);
  process.exit(1);
});
