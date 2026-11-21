import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const imageMapByNameFragment = [
  { match: 'Hikvision DS-2CE56D0T', images: ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Dahua 4 Channel', images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Godrej SeeThru', images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'] },
  { match: 'TP-Link Tapo C210', images: ['https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg'] },
  { match: 'D-Link DGS-1008A', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Samsung 23 L Solo', images: ['https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg'] },
  { match: 'Prestige PIC 20', images: ['https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg'] },
  { match: 'IFB 20L Convection', images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Bajaj Majesty ICX', images: ['https://m.media-amazon.com/images/I/61xm5RZx0+L.jpg'] },
  { match: 'V-Guard Divino', images: ['https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg'] },
  { match: 'Racold Pronto Pro', images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Microtek EM4160', images: ['https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg'] },
  { match: 'Crompton Amica', images: ['https://m.media-amazon.com/images/I/81yqngFpv2L.jpg'] },
  { match: 'V-Guard VG 50', images: ['https://m.media-amazon.com/images/I/61boyZ18neL.jpg'] },
  { match: 'Siemens SINAMICS V20 1.5', images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'] },
  { match: 'L&T MK1 Direct', images: ['https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'] },
  { match: 'Delta VFD-L', images: ['https://m.media-amazon.com/images/I/61tZrJctKoL.jpg'] },
  { match: 'Automatic Water Level', images: ['https://m.media-amazon.com/images/I/51NQOVIi7rL.jpg'] },
  { match: 'Schneider Electric Acti9', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'] },
  { match: 'Havells Crabtree 63A', images: ['https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'] },
  { match: 'Polycab 2.5 Sq.mm Single Core Copper', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'] },
  { match: 'L&T 32A 4-Pole Rotary', images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'] }
];

async function update() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;

  console.log('Connecting to Firestore...');
  const firestoreSnap = await getDocs(collection(db, 'products'));
  const firestoreDocs = [];
  firestoreSnap.forEach(d => firestoreDocs.push({ id: d.id, ...d.data() }));

  let updatedMongo = 0;
  let updatedFirestore = 0;

  for (const item of imageMapByNameFragment) {
    // 1. Update MongoDB
    const filter = { name: { $regex: item.match, $options: 'i' } };
    const res = await mongoDb.collection('products').updateMany(filter, {
      $set: { images: item.images }
    });
    if (res.modifiedCount > 0) {
      updatedMongo += res.modifiedCount;
      console.log(`[MongoDB] Updated ${item.match} -> ${item.images[0].substring(0, 50)}...`);
    }

    // 2. Update Firestore
    for (const fDoc of firestoreDocs) {
      if (fDoc.name && fDoc.name.toLowerCase().includes(item.match.toLowerCase())) {
        try {
          const docRef = doc(db, 'products', fDoc.id);
          await updateDoc(docRef, { images: item.images });
          updatedFirestore++;
          console.log(`[Firestore] Updated ${item.match}`);
        } catch (e) {
          console.warn(`[Firestore] Error on ${item.match}:`, e.message);
        }
      }
    }
  }

  console.log(`\n🎉 Image Update Complete!`);
  console.log(`MongoDB products updated: ${updatedMongo}`);
  console.log(`Firestore products updated: ${updatedFirestore}`);
  process.exit(0);
}

update().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
