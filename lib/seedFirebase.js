import bcrypt from 'bcryptjs';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';

export async function seedFirebaseDatabase() {
  try {
    console.log('[SEED] Checking Firestore collections...');

    // 1. Seed Admin
    const adminCol = collection(db, 'admins');
    const adminSnap = await getDocs(adminCol);
    if (adminSnap.empty) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await addDoc(adminCol, {
        username,
        password: hashedPassword,
        createdAt: Timestamp.now(),
      });
      console.log(`[SEED] Admin account seeded: ${username}`);
    }

    // 2. Seed Settings
    const settingsDocRef = doc(db, 'settings', 'global_settings');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, {
        shopName: 'JAYAMBE INTEGRATORS',
        ownerName: 'Er. Anand',
        designation: 'EXTC ENGINEER',
        ownerPhoto: '/Anand.jpeg',
        email: 'anandp4994@gmail.com',
        phone: '+91 8879430925',
        whatsapp: '918879430925',
        address: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
        workingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed',
        banners: [
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        ],
        updatedAt: Timestamp.now(),
      });
      console.log('[SEED] Default settings seeded in settings/global_settings.');
    } else {
      // Migrate existing settings in Firebase to ensure ownerPhoto is set if missing
      const existingData = settingsSnap.data();
      if (!existingData.hasOwnProperty('ownerPhoto')) {
        await setDoc(settingsDocRef, { ownerPhoto: '/Anand.jpeg' }, { merge: true });
        console.log('[SEED] Migrated existing Firebase settings with ownerPhoto.');
      }
    }

    // 3. Seed Categories
    const categoryCol = collection(db, 'categories');
    const categorySnap = await getDocs(categoryCol);
    let categoriesList = [];

    const targetCategories = [
      { name: 'CCTV & Intercom Systems', slug: 'cctv-intercom', description: 'Surveillance and communication solutions.', icon: 'Camera' },
      { name: 'Microwave & Induction', slug: 'microwave-induction', description: 'Heating and kitchen appliance repair & spare parts.', icon: 'Cpu' },
      { name: 'Geyser & Stabilizer', slug: 'geyser-stabilizer', description: 'Water heating and power stability systems.', icon: 'Zap' },
      { name: 'VFD Drives & Control Panels', slug: 'vfd-control-panel', description: 'Industrial automation variable frequency drives and panels.', icon: 'Boxes' },
      { name: 'Electrical & Electronic Spares', slug: 'electrical-electronic-spares', description: 'Replacement parts and components.', icon: 'Grid' },
    ];

    if (categorySnap.empty) {
      for (const cat of targetCategories) {
        const docRef = await addDoc(categoryCol, {
          ...cat,
          createdAt: Timestamp.now(),
        });
        categoriesList.push({ id: docRef.id, ...cat });
      }
      console.log('[SEED] Categories seeded in categories collection.');
    } else {
      categorySnap.forEach((docSnap) => {
        categoriesList.push({ id: docSnap.id, ...docSnap.data() });
      });
    }

    // 4. Seed Products
    const productCol = collection(db, 'products');
    const productSnap = await getDocs(productCol);
    if (productSnap.empty) {
      const catCCTV = categoriesList.find(c => c.slug === 'cctv-intercom')?.id || categoriesList[0].id;
      const catGeyser = categoriesList.find(c => c.slug === 'geyser-stabilizer')?.id || categoriesList[2].id;
      const catVFD = categoriesList.find(c => c.slug === 'vfd-control-panel')?.id || categoriesList[3].id;

      const sampleProducts = [
        {
          name: 'Hikvision 4-Camera CCTV Security Kit with Intercom',
          price: 16500,
          condition: 'new',
          description: 'Full HD 1080P Hikvision security system. Kit contains 2 Dome cameras (indoor), 2 Bullet cameras (outdoor weatherproof), 4-Channel Turbo HD DVR, 1TB surveillance HDD, intercom handset and wiring setup. High-quality security integration for homes and offices.',
          images: [
            'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          ],
          categoryId: catCCTV,
          stock: 5,
          availability: true,
          featured: true,
        },
        {
          name: 'Delta VFD Drive 2.2kW 3-Phase',
          price: 18900,
          condition: 'new',
          description: 'Delta Electronics Variable Frequency Drive (VFD) 2.2kW 3HP 3-Phase AC motor controller. Excellent control performance, built-in PLC, robust design for industrial automation. Authentic Delta product with manufacturer warranty.',
          images: [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
          ],
          categoryId: catVFD,
          stock: 3,
          availability: true,
          featured: true,
        },
        {
          name: 'Gelco Automatic Voltage Stabilizer 5kVA',
          price: 8500,
          condition: 'new',
          description: 'Gelco Electronics digital automatic voltage stabilizer for mains supply. Built-in high/low cut-off, time delay, overload protection. Premium copper winding for long life. Best protection for household electronics and geysers.',
          images: [
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          ],
          categoryId: catGeyser,
          stock: 4,
          availability: true,
          featured: true,
        },
        {
          name: 'Crompton 15L Storage Geyser (Used - Excellent)',
          price: 4800,
          condition: 'used',
          description: 'Crompton Greaves 15-liter storage geyser. Fully serviced, cleaned, and checked for heating element resistance and leakage by our engineers. Excellent working condition with 3 months shop warranty.',
          images: [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          ],
          categoryId: catGeyser,
          stock: 2,
          availability: true,
          featured: false,
        },
      ];

      for (const prod of sampleProducts) {
        await addDoc(productCol, {
          ...prod,
          createdAt: Timestamp.now(),
        });
      }
      console.log('[SEED] Default sample products seeded in products collection.');
    }

    // 5. Seed Gallery
    const galleryCol = collection(db, 'gallery');
    const gallerySnap = await getDocs(galleryCol);
    if (gallerySnap.empty) {
      const sampleGallery = [
        {
          title: 'CCTV Security Setup at Boisar Industrial Zone',
          description: 'Designed and deployed an 8-camera outdoor high-definition IP camera network with PoE switch and 4TB NVR for continuous 30-day recording. Remote viewing enabled on client mobile devices.',
          mediaUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
          createdAt: Timestamp.now(),
        },
        {
          title: 'Office Server Rack Cabinet Networking',
          description: 'Structured cabling, installation of Cat6 patch panels, Gigabit network switch configuration, and neat wire routing inside a 9U server rack cabinet for a corporate office client.',
          mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
          createdAt: Timestamp.now(),
        }
      ];
      for (const item of sampleGallery) {
        await addDoc(galleryCol, item);
      }
      console.log('[SEED] Default gallery items seeded in gallery collection.');
    }
  } catch (err) {
    console.error('[SEED] Firestore database seeding error:', err);
  }
}
