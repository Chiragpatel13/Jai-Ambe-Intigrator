import fs from 'fs';
import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const categoriesToSearch = [
  {
    slug: 'cctv-intercom',
    queries: ['Hikvision IP CCTV Camera', 'CP PLUS Bullet Camera', 'Video Door Phone Intercom', 'POE Switch 8 port', 'CCTV DVR 8 channel']
  },
  {
    slug: 'microwave-induction',
    queries: ['Samsung Solo Microwave Oven', 'Prestige Induction Cooktop', 'IFB Convection Microwave', 'Philips Induction Cooktop', 'Bajaj Solo Microwave']
  },
  {
    slug: 'geyser-stabilizer',
    queries: ['V-Guard Water Heater Geyser 15L', 'Havells Storage Geyser 25L', 'Microtek AC Voltage Stabilizer 4kVA', 'Crompton Instant Geyser 3L', 'V-Guard Refrigerator Stabilizer']
  },
  {
    slug: 'vfd-control-panel',
    queries: ['Variable Frequency Drive 1.5kW', 'Siemens VFD Drive Inverter', '3 Phase DOL Motor Starter', 'Submersible Pump Control Panel', 'Delta Inverter Drive VFD']
  },
  {
    slug: 'electrical-electronic-spares',
    queries: ['Schneider 63A 4 Pole MCB', 'Havells 32A DP Switch with box', 'Polycab 4 sq mm copper wire coil', 'L&T Changeover Switch 63A', 'Legrand RCCB 40A 30mA']
  }
];

async function run() {
  console.log('Connecting to databases...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;

  const mongoCategories = await mongoDb.collection('categories').find({}).toArray();
  const mongoCatMap = {};
  mongoCategories.forEach(c => { mongoCatMap[c.slug] = c._id; });

  const firestoreCategorySnap = await getDocs(collection(db, 'categories'));
  const firestoreCatMap = {};
  firestoreCategorySnap.forEach(d => { firestoreCatMap[d.data().slug] = d.id; });

  const existingMongoNames = new Set(
    (await mongoDb.collection('products').find({}, { projection: { name: 1 } }).toArray()).map(p => p.name.toLowerCase())
  );

  let totalAdded = 0;
  const usedToggle = [true, false]; // Alternate between new and used
  let toggleIdx = 0;

  for (const catGroup of categoriesToSearch) {
    console.log(`\n=== Processing Category: ${catGroup.slug} ===`);

    for (const q of catGroup.queries) {
      try {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
        const searchRes = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
          }
        });
        const searchHtml = await searchRes.text();
        const asins = [...searchHtml.matchAll(/data-asin="(B0[A-Z0-9]{8})"/g)].map(x => x[1]);

        let chosenAsin = null;
        for (const a of asins) {
          if (!a.startsWith('B0000')) {
            chosenAsin = a;
            break;
          }
        }

        if (!chosenAsin) {
          console.log(`  No ASIN found for "${q}"`);
          continue;
        }

        // Fetch Product Page
        const prodUrl = `https://www.amazon.in/dp/${chosenAsin}`;
        const prodRes = await fetch(prodUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en;q=0.9',
          }
        });
        const prodHtml = await prodRes.text();

        // Title
        const titleMatch = prodHtml.match(/id="productTitle"[^>]*>\s*([^<]+)\s*<\/span>/i) ||
                           prodHtml.match(/<title>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].replace(/(\s*: Amazon\.in.*|\s*:\s*Electronics.*)/i, '').trim() : q;
        title = title.replace(/^Buy\s+/i, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

        if (existingMongoNames.has(title.toLowerCase())) {
          console.log(`  Already exists in DB: ${title.substring(0, 40)}`);
          continue;
        }

        // Price
        const priceWhole = prodHtml.match(/class="a-price-whole">([0-9,]+)/i);
        let price = priceWhole ? parseFloat(priceWhole[1].replace(/,/g, '')) : 0;
        if (!price) {
          const pMatch = prodHtml.match(/"priceAmount":([0-9.]+)/i);
          if (pMatch) price = parseFloat(pMatch[1]);
        }
        if (!price) price = 1999;

        // Brand
        const brandMatch = prodHtml.match(/class="po-brand"[^>]*>[\s\S]*?class="po-break-word">([^<]+)<\/span>/i) ||
                           prodHtml.match(/class="po-brand"[^>]*>[\s\S]*?class="a-size-base">([^<]+)<\/span>/i);
        let brand = brandMatch ? brandMatch[1].trim() : q.split(' ')[0];

        // Images
        const imageIds = new Set();
        const colorBlockMatch = prodHtml.match(/'colorImages':[\s\S]*?\}\);/);
        if (colorBlockMatch) {
          const matches = [...colorBlockMatch[0].matchAll(/https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+)(?:\._[^"]+)?\.(?:jpg|png)/gi)];
          for (const m of matches) {
            if (m[1].length >= 9 && !m[1].startsWith('01') && !m[1].includes('transparent')) {
              imageIds.add(m[1]);
            }
          }
        }
        if (imageIds.size === 0) {
          const matches = [...prodHtml.slice(0, 150000).matchAll(/https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]{10,12})(?:\._[^"]+)?\.(?:jpg|png)/gi)];
          for (const m of matches) imageIds.add(m[1]);
        }

        const images = Array.from(imageIds).slice(0, 5).map(id => `https://m.media-amazon.com/images/I/${id}.jpg`);
        if (images.length === 0) {
          images.push('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80');
        }

        // Bullets / Description
        const bullets = [];
        const fbMatch = prodHtml.match(/<div id="feature-bullets"[\s\S]*?<\/ul>/i);
        if (fbMatch) {
          const liRegex = /<span class="a-list-item">\s*([^<]+)\s*<\/span>/gi;
          let match;
          while ((match = liRegex.exec(fbMatch[0])) !== null) {
            const text = match[1].trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"');
            if (text && !text.includes('Amazon') && !text.includes('Delivery')) {
              bullets.push(text);
            }
          }
        }

        const isUsed = usedToggle[toggleIdx % 2];
        toggleIdx++;
        const condition = isUsed ? 'used' : 'new';
        const finalTitle = isUsed ? (title.includes('(Used)') ? title : `${title} (Used)`) : title;
        const finalPrice = isUsed ? Math.round(price * 0.55) : price;

        const description = bullets.length > 0 
          ? bullets.slice(0, 4).join('\n• ') 
          : `${title}. Genuine high quality product with manufacturer warranty. Tested for reliability and durability.`;

        const mongoDoc = {
          name: finalTitle,
          price: finalPrice,
          condition,
          description: description.startsWith('• ') ? description : '• ' + description,
          images,
          category: mongoCatMap[catGroup.slug] || mongoCategories[0]._id,
          stock: isUsed ? 2 : 5,
          availability: true,
          featured: false,
          brand,
          warranty: isUsed ? '3 Months Shop Warranty' : '1 Year Manufacturer Warranty',
          location: 'Boisar',
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0,
        };

        await mongoDb.collection('products').insertOne(mongoDoc);
        existingMongoNames.add(finalTitle.toLowerCase());

        try {
          await addDoc(collection(db, 'products'), {
            name: finalTitle,
            price: finalPrice,
            condition,
            description: mongoDoc.description,
            images,
            categoryId: firestoreCatMap[catGroup.slug] || Object.values(firestoreCatMap)[0],
            stock: mongoDoc.stock,
            availability: true,
            featured: false,
            brand,
            warranty: mongoDoc.warranty,
            location: 'Boisar',
            reviews: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } catch (fErr) {
          console.warn('  Firestore warning:', fErr.message);
        }

        totalAdded++;
        console.log(`  [ADDED #${totalAdded}] [${condition.toUpperCase()}] ${finalTitle.substring(0, 40)} | ₹${finalPrice} | Imgs: ${images.length}`);
      } catch (err) {
        console.error(`  Error on ${q}:`, err.message);
      }
    }
  }

  const finalTotal = await mongoDb.collection('products').countDocuments();
  console.log(`\n🎉 Batch Addition Complete! Added ${totalAdded} new products. Total catalog size: ${finalTotal}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
