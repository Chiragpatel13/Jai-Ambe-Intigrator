import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const new16Products = [
  // ── 1. CCTV & Intercom Systems (3 items) ──
  {
    name: 'CP PLUS 2.4MP Full HD Cosmic Dome Camera (CP-VAC-D24L2)',
    price: 1350,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'CP PLUS',
    warranty: '2 Years Manufacturer Warranty',
    stock: 10,
    images: [
      'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 2.4 Megapixel Cosmic high-performance image sensor with crystal clear 1080p full HD resolution\n• 3.6 mm wide-angle fixed focal lens providing extensive coverage for shops and homes\n• Smart IR distance up to 20 meters with ICR automatic day/night switching\n• Supports 4-in-1 switchable video formats (HD-CVI, HD-TVI, AHD, and Analog CVBS)'
  },
  {
    name: 'Hikvision 8-Channel Turbo HD DVR (DS-7208HGHI-K1) (Used)',
    price: 2800,
    condition: 'used',
    categorySlug: 'cctv-intercom',
    brand: 'Hikvision',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg'
    ],
    description: '• Bench-tested pre-owned 8-channel digital video recorder with updated firmware\n• Efficient H.265 Pro+ compression saving up to 75% storage compared to older formats\n• Supports up to 1080p Lite recording across all 8 BNC channels plus 2 extra IP camera channels\n• Equipped with HDMI & VGA dual simultaneous display outputs'
  },
  {
    name: 'Secureye S-FB4K Biometric Face & Fingerprint Attendance Machine',
    price: 5450,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'Secureye',
    warranty: '1 Year Manufacturer Warranty',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Touchless AI face recognition, optical fingerprint sensor, and RFID card reader in one device\n• Fast facial recognition speed under 0.5s with anti-spoofing dual camera detection\n• Stores up to 1,500 faces, 3,000 fingerprints, and 160,000 log records\n• TCP/IP and USB drive download support for effortless payroll and shift reports'
  },

  // ── 2. Microwave & Induction (3 items) ──
  {
    name: 'Panasonic 27L Convection Microwave Oven with 360 Degree Heat (NN-CT645BFDG)',
    price: 14200,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Panasonic',
    warranty: '1 Year Comprehensive + 5 Years Magnetron Warranty',
    stock: 4,
    images: [
      'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 27L large capacity suitable for 4 to 6 member households with 360-degree heat distribution\n• 101 pre-programmed Auto Cook menus featuring authentic traditional Indian recipes\n• Zero-oil Diet Fry technology for healthy, crunchy snacks without oil bathing\n• Stainless steel interior cavity for easy oil splatter wipe-down and high durability'
  },
  {
    name: 'Prestige Iris 2000W Induction Cooktop with Indian Menu (Used)',
    price: 1600,
    condition: 'used',
    categorySlug: 'microwave-induction',
    brand: 'Prestige',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg',
      'https://m.media-amazon.com/images/I/61xm5RZx0+L.jpg'
    ],
    description: '• Inspected and tested pre-owned 2000W induction stove with clean ceramic glass\n• Indian menu options with automatic power and temperature regulation\n• Dual heat sensor mechanism prevents dry boil and vessel burning\n• Feather-touch push button controls with clear LED display'
  },
  {
    name: 'Bajaj 17L Solo Microwave Oven with 30-min Timer (1701 MT)',
    price: 5100,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Bajaj',
    warranty: '1 Year Manufacturer Warranty',
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg'
    ],
    description: '• 17 Litre solo microwave oven tailored for single professionals and small families\n• 5 distinct power levels for controlled heating, cooking, and rapid defrosting\n• Easy-to-use mechanical dial knobs engineered for reliable daily kitchen operation\n• 30-minute timer with audible cooking completion buzzer'
  },

  // ── 3. Geyser & Stabilizer (3 items) ──
  {
    name: 'Crompton Arno Neo 15L 5-Star Storage Water Heater Geyser',
    price: 6499,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'Crompton',
    warranty: '5 Years Tank + 2 Years Element Warranty',
    stock: 8,
    images: [
      'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg',
      'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg'
    ],
    description: '• BEE 5-star energy rated 15L geyser with superior high-density PUF insulation\n• Nano Polybond tank coating resists corrosion and scaling even in hard borewell water\n• Capable of withstanding up to 8 bar pressure for high-rise buildings\n• Advanced 3-level safety system: capillary thermostat, automatic thermal cutout, and safety valve'
  },
  {
    name: 'Microtek EML5090 Automatic Mainline Stabilizer 90V-300V (Used)',
    price: 6200,
    condition: 'used',
    categorySlug: 'geyser-stabilizer',
    brand: 'Microtek',
    warranty: '6 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg',
      'https://m.media-amazon.com/images/I/61boyZ18neL.jpg'
    ],
    description: '• Heavy-duty mainline automatic stabilizer refurbished and tested under heavy resistive load\n• Ultra-wide working input voltage window from 90V down to 300V high cut\n• High-precision Intelli Microchip technology ensures rapid output voltage correction\n• Dual digital meters for continuous input and output voltage monitoring'
  },
  {
    name: 'Orient Electric Enamour Prime 25L Glassline Storage Geyser',
    price: 9800,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'Orient Electric',
    warranty: '7 Years Tank + 3 Years Element Warranty',
    stock: 5,
    images: [
      'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg',
      'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg'
    ],
    description: '• 25L storage water heater with Ultra-Diamond glassline enamel coated tank\n• Whirlflow technology ensures 20% more hot water output by preventing sudden cold mix\n• High-grade magnesium anode rod provides sacrificial cathodic protection against rust\n• External temperature control dial with illuminated heating and power indicators'
  },

  // ── 4. VFD Drives & Control Panels (3 items) ──
  {
    name: 'Delta MS300 Series 1.5kW Compact Vector Control VFD (Used)',
    price: 9400,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'Delta',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Industrial compact standard vector control inverter drive (1.5kW / 2 HP, 3-Phase 400V)\n• High-speed frequency output up to 599 Hz with built-in PLC capacity up to 2k steps\n• STO (Safe Torque Off) safety certified with built-in brake chopper\n• Clean pre-owned condition, tested on industrial induction motor load'
  },
  {
    name: 'L&T Single Phase Submersible Pump Control Panel 1.5 HP (MU-G)',
    price: 3250,
    condition: 'new',
    categorySlug: 'vfd-control-panel',
    brand: 'L&T',
    warranty: '1 Year Manufacturer Warranty',
    stock: 7,
    images: [
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg',
      'https://m.media-amazon.com/images/I/51NQOVIi7rL.jpg'
    ],
    description: '• Heavy-duty 1.5 HP motor starter panel designed specifically for single phase borewell pumps\n• Built with authentic L&T contactor and thermal overload relay for motor burnout prevention\n• High-grade starting and running capacitors for smooth motor kick-start without voltage sag\n• Powder-coated deep drawn sheet enclosure with analog voltmeter & ammeter'
  },
  {
    name: 'Fuji Electric FRENIC-Mini 0.75kW 3-Phase Compact Inverter Drive (Used)',
    price: 7800,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'Fuji Electric',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg'
    ],
    description: '• Genuine Japanese engineered Fuji Electric compact VFD (0.75kW / 1 HP, 3-Phase 415V)\n• High starting torque of 150% at 5 Hz with dynamic torque vector control\n• Ideal for conveyors, packaging machinery, woodworking, and small ventilation fans\n• Tested and factory-reset with full keypad control accessibility'
  },

  // ── 5. Electrical & Electronic Spares (4 items) ──
  {
    name: 'Havells Euro-II 40A Double Pole Isolator Switch',
    price: 480,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Havells',
    warranty: '2 Years Manufacturer Warranty',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
    ],
    description: '• 40 Ampere 2-Pole main isolator disconnect switch compliant with IS/IEC 60947-3\n• Heavy-duty silver alloy contacts provide positive break disconnection\n• DIN rail mounting with bi-connect terminals for flexible busbar and wire connection\n• High short-circuit withstand rating and flame retardant thermoplastic enclosure'
  },
  {
    name: 'Siemens 3TF30 3-Pole 9A Power Contactor with 230V AC Coil (Used)',
    price: 850,
    condition: 'used',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Siemens',
    warranty: '3 Months Shop Warranty',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Authentic Siemens Sirius 3TF30 contactor (9A AC-3, 4kW @ 415V) with 1 NO auxiliary contact\n• 230V 50Hz AC operating coil; contacts inspected, cleaned, and verified for low contact resistance\n• Suitable for industrial switching, capacitor duty, and motor control panels\n• Screw clamp terminal connection with DIN rail snap-on mounting'
  },
  {
    name: 'Finolex 4 Sq.mm Industrial Multi-Strand Copper Wire (90m Roll)',
    price: 3950,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Finolex',
    warranty: 'Manufacturer Guarantee',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
    ],
    description: '• 90-meter genuine coil of 4.0 sq.mm multi-strand bright annealed electrolytic grade copper wire\n• Flame Retardant (FR) PVC compound with high insulation resistance and oxygen index\n• Ideal for high-amperage domestic and industrial power wiring (AC circuits, power distribution)\n• Certified to IS 694 with tamper-evident packaging'
  },
  {
    name: 'Schneider Electric Easy9 63A 4-Pole 30mA RCCB (Used)',
    price: 2100,
    condition: 'used',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Schneider Electric',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 63A 4-Pole Residual Current Circuit Breaker with 30mA trip threshold for personnel shock protection\n• Bench tested with calibrated earth fault leakage tester; trips accurately within IEC specified time\n• Test pushbutton for periodic operational verification\n• Front-panel green/red trip flag indicator'
  }
];

const categoryIdMap = {
  'cctv-intercom': {
    mongo: '6a22c4d52e44d8777bcd83a0',
    firestore: 'cctv-intercom'
  },
  'microwave-induction': {
    mongo: '6a22c4d52e44d8777bcd83a1',
    firestore: 'microwave-induction'
  },
  'geyser-stabilizer': {
    mongo: '6a22c4d52e44d8777bcd83a2',
    firestore: 'geyser-stabilizer'
  },
  'vfd-control-panel': {
    mongo: '6a22c4d52e44d8777bcd83a3',
    firestore: 'vfd-control-panel'
  },
  'electrical-electronic-spares': {
    mongo: '6a22c4d52e44d8777bcd83a4',
    firestore: 'electrical-electronic-spares'
  }
};

async function insertAll() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;

  console.log('Fetching Firestore categories...');
  const fCatsSnap = await getDocs(collection(db, 'categories'));
  const firestoreCategorySlugMap = {};
  fCatsSnap.forEach(d => {
    const data = d.data();
    firestoreCategorySlugMap[data.slug] = d.id;
  });

  let mongoCount = 0;
  let firestoreCount = 0;

  for (let i = 0; i < new16Products.length; i++) {
    const p = new16Products[i];
    const catMapping = categoryIdMap[p.categorySlug];
    const mongoCatId = new mongoose.Types.ObjectId(catMapping.mongo);
    const firestoreCatId = firestoreCategorySlugMap[p.categorySlug] || catMapping.firestore;

    // Check duplicate in MongoDB
    const existingMongo = await mongoDb.collection('products').findOne({ name: p.name });
    if (!existingMongo) {
      const mongoDoc = {
        name: p.name,
        price: p.price,
        condition: p.condition,
        description: p.description,
        images: p.images,
        category: mongoCatId,
        stock: p.stock,
        availability: true,
        featured: false,
        brand: p.brand,
        warranty: p.warranty,
        location: 'Boisar',
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };
      await mongoDb.collection('products').insertOne(mongoDoc);
      mongoCount++;
      console.log(`[MongoDB #${mongoCount}] Added: [${p.condition.toUpperCase()}] ${p.name} (₹${p.price})`);
    } else {
      console.log(`[MongoDB] Skipped existing: ${p.name}`);
    }

    // Insert into Firestore
    try {
      await addDoc(collection(db, 'products'), {
        name: p.name,
        price: p.price,
        condition: p.condition,
        description: p.description,
        images: p.images,
        categoryId: firestoreCatId,
        stock: p.stock,
        availability: true,
        featured: false,
        brand: p.brand,
        warranty: p.warranty,
        location: 'Boisar',
        reviews: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      firestoreCount++;
      console.log(`[Firestore #${firestoreCount}] Added: ${p.name.substring(0, 40)}`);
    } catch (fErr) {
      console.warn(`[Firestore] Error on ${p.name}:`, fErr.message);
    }
  }

  const finalTotal = await mongoDb.collection('products').countDocuments();
  console.log('\n=======================================');
  console.log(`Successfully added to MongoDB: ${mongoCount}`);
  console.log(`Successfully added to Firestore: ${firestoreCount}`);
  console.log(`Total Products in Catalog Now: ${finalTotal}`);
  console.log('=======================================');

  await mongoose.disconnect();
  process.exit(0);
}

insertAll().catch(err => {
  console.error('Fatal insertion error:', err);
  process.exit(1);
});
