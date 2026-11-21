import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const newBatchProducts = [
  // ── 1. CCTV & Intercom Systems (5 products) ──
  {
    name: 'Hikvision DS-2CE56D0T-IPECO 2MP Indoor Dome CCTV Camera',
    price: 1250,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'Hikvision',
    warranty: '2 Years Manufacturer Warranty',
    stock: 8,
    images: [
      'https://m.media-amazon.com/images/I/41T2YmN-z7L.jpg',
      'https://m.media-amazon.com/images/I/41-Jb7mH8BL.jpg',
      'https://m.media-amazon.com/images/I/51wWfP3tKxL.jpg'
    ],
    description: '• 2 Megapixel high-performance CMOS with 1920 × 1080 resolution\n• 2.8 mm, 3.6 mm, 6 mm fixed focal lens options\n• Smart IR technology with up to 20 m IR distance for clear night vision\n• Switchable TVI/AHD/CVI/CVBS output for universal DVR compatibility'
  },
  {
    name: 'Dahua 4 Channel 1080P Full HD Pentabrid DVR (DH-XVR1B04-I)',
    price: 3150,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'Dahua',
    warranty: '2 Years Manufacturer Warranty',
    stock: 5,
    images: [
      'https://m.media-amazon.com/images/I/51xP+1hG6lL.jpg',
      'https://m.media-amazon.com/images/I/41gT8Pq4LHL.jpg',
      'https://m.media-amazon.com/images/I/51UjN3dYrVL.jpg'
    ],
    description: '• H.265+/H.265 dual-stream video compression for 50% storage saving\n• Supports HDCVI/AHD/TVI/CVBS/IP video inputs with auto-detection\n• Supports 1 SATA HDD up to 6TB capacity for long-term recording\n• AI-powered SMD Plus motion detection minimizes false alarms'
  },
  {
    name: 'Godrej SeeThru RE 7 Video Door Phone with Two-Way Intercom (Used)',
    price: 3600,
    condition: 'used',
    categorySlug: 'cctv-intercom',
    brand: 'Godrej',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61N+5pTq8rL.jpg',
      'https://m.media-amazon.com/images/I/41Kq5aL8o+L.jpg'
    ],
    description: '• Refurbished / Pre-owned unit, tested and certified for audio & video clarity\n• 7-inch high resolution colour TFT LCD indoor monitor\n• Weatherproof outdoor pinhole camera unit with night vision LEDs\n• Two-way intercom audio communication with door lock release button'
  },
  {
    name: 'TP-Link Tapo C210 2K 3MP Pan/Tilt Smart Wi-Fi Security Camera',
    price: 2199,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'TP-Link',
    warranty: '2 Years Manufacturer Warranty',
    stock: 6,
    images: [
      'https://m.media-amazon.com/images/I/51N-a38sVYL.jpg',
      'https://m.media-amazon.com/images/I/51n2R2Lg-6L.jpg',
      'https://m.media-amazon.com/images/I/51XgK-WlY9L.jpg'
    ],
    description: '• Ultra-high-definition 2K 3MP video capturing every detail with crystal clarity\n• 360º horizontal and 114º vertical pan/tilt motion range\n• Advanced night view up to 30 ft with smart person detection\n• Two-way audio communication and local microSD storage up to 512GB'
  },
  {
    name: 'D-Link DGS-1008A 8-Port Gigabit Unmanaged Switch (Used)',
    price: 1150,
    condition: 'used',
    categorySlug: 'cctv-intercom',
    brand: 'D-Link',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/61S1kK4t8xL.jpg',
      'https://m.media-amazon.com/images/I/51M3vE7zNqL.jpg'
    ],
    description: '• Pre-owned 8-port gigabit switch in mint condition, benchmarked for 1000Mbps throughput\n• 8 Gigabit Ethernet ports for fast and reliable CCTV/NVR networking\n• D-Link Green technology saves power automatically on idle ports\n• Compact desktop design with silent fanless operation'
  },

  // ── 2. Microwave & Induction (4 products) ──
  {
    name: 'Samsung 23 L Solo Microwave Oven (MS23A3513AK/TL, Black)',
    price: 6890,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Samsung',
    warranty: '1 Year Comprehensive + 10 Years on Cavity',
    stock: 4,
    images: [
      'https://m.media-amazon.com/images/I/61y8A2r9dJL.jpg',
      'https://m.media-amazon.com/images/I/61Kq-g9mN-L.jpg',
      'https://m.media-amazon.com/images/I/51U4sJ1D+cL.jpg'
    ],
    description: '• 23L capacity suitable for families of 3 to 4 members\n• Ceramic Inside cavity: 99.9% anti-bacterial, easy to clean & scratch resistant\n• Quick Defrost function with automatic power setting for 5 popular food types\n• ECO Mode significantly reduces energy consumption on standby'
  },
  {
    name: 'Prestige PIC 20 1600W Induction Cooktop with Push Button Controls',
    price: 1799,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Prestige',
    warranty: '1 Year Manufacturer Warranty',
    stock: 7,
    images: [
      'https://m.media-amazon.com/images/I/61s8zW-xUPL.jpg',
      'https://m.media-amazon.com/images/I/61hX4S7o7zL.jpg',
      'https://m.media-amazon.com/images/I/51n6g5uD8mL.jpg'
    ],
    description: '• 1600 Watts induction cooktop engineered for Indian cooking styles\n• Anti-magnetic wall prevents magnetic radiation leakage for high energy efficiency\n• Intelligent automatic voltage regulator protects against high/low fluctuations\n• Pre-set Indian menu options for idli, dosa, chapati, curry and milk boiling'
  },
  {
    name: 'IFB 20L Convection Microwave Oven (20SC2, Metallic Silver) (Used)',
    price: 4800,
    condition: 'used',
    categorySlug: 'microwave-induction',
    brand: 'IFB',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61eJ2fX0W+L.jpg',
      'https://m.media-amazon.com/images/I/61aWb8wS97L.jpg'
    ],
    description: '• Used / Refurbished convection unit, tested for baking, grilling, and reheating\n• Multi-stage cooking with 24 standard auto-cook menus\n• Stainless steel cavity reflects microwaves evenly for uniform heat distribution\n• Steam clean feature removes oil residues effortlessly'
  },
  {
    name: 'Bajaj Majesty ICX 140 1400W Induction Cooktop (Used)',
    price: 1100,
    condition: 'used',
    categorySlug: 'microwave-induction',
    brand: 'Bajaj',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/61D8c4fXkBL.jpg',
      'https://m.media-amazon.com/images/I/51dO4i-w8-L.jpg'
    ],
    description: '• Inspected pre-owned unit with pristine glass top and tested heating coil\n• 1400 Watt power output with 7 pre-set Indian menu choices\n• Built-in timer and temperature control settings\n• Auto shut-off sensor prevents dry boiling and pan overheating'
  },

  // ── 3. Geyser & Stabilizer (5 products) ──
  {
    name: 'V-Guard Divino 15 Litre 5-Star Storage Water Heater Geyser',
    price: 6199,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'V-Guard',
    warranty: '2 Years Comprehensive + 5 Years Tank Warranty',
    stock: 5,
    images: [
      'https://m.media-amazon.com/images/I/51y1y6q+UQL.jpg',
      'https://m.media-amazon.com/images/I/51m-Z0w7kIL.jpg',
      'https://m.media-amazon.com/images/I/51S4gXwV9DL.jpg'
    ],
    description: '• Extra thick vitreous enamel-coated inner tank prevents corrosion even with hard water\n• BEE 5-Star rated with high-density CFC-free PUF insulation for maximum heat retention\n• Dual thermostats and multi-functional safety valve with pressure rating up to 8 bar\n• Sacrificial magnesium anode rod protects internal tank walls'
  },
  {
    name: 'Racold Pronto Pro 3 Litres 3kW Instant Water Heater Geyser',
    price: 2899,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'Racold',
    warranty: '2 Years on Product + 5 Years on Tank',
    stock: 6,
    images: [
      'https://m.media-amazon.com/images/I/51cM0S3jD7L.jpg',
      'https://m.media-amazon.com/images/I/51r2R-v+9xL.jpg'
    ],
    description: '• High-power 3000W heating element provides instant hot water within seconds\n• Italian design with anti-siphoning system preventing dry heating of the element\n• Rust-proof thermoplastic exterior body suitable for bathroom or kitchen mounting\n• 6.5 bar pressure capability compatible with multi-storey residential towers'
  },
  {
    name: 'Microtek EM4160+ Automatic AC Voltage Stabilizer 160V-285V (Used)',
    price: 1550,
    condition: 'used',
    categorySlug: 'geyser-stabilizer',
    brand: 'Microtek',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/61k1q-jD+6L.jpg',
      'https://m.media-amazon.com/images/I/51tW3uK8tKL.jpg'
    ],
    description: '• Load-tested pre-owned stabilizer designed for 1.5 Ton split & window AC units\n• Wide input voltage window from 160V to 285V regulating to steady 220V output\n• Intelli-Microchip technology ensures high reliability and power saving\n• Smart time delay system protects air conditioner compressor from rapid cycles'
  },
  {
    name: 'Crompton Amica 15L Storage Water Heater Geyser (Used)',
    price: 3400,
    condition: 'used',
    categorySlug: 'geyser-stabilizer',
    brand: 'Crompton',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61qS3fV+5kL.jpg',
      'https://m.media-amazon.com/images/I/51kR5tT9gHL.jpg'
    ],
    description: '• Descaled and leakage-tested pre-owned 15L storage geyser in solid condition\n• Heavy copper heating element coated with nickel for extended operational life\n• Nano Polybond tank coating resists oxidation under high temperature & pressure\n• Precision capillary thermostat maintains set water temperature accurately'
  },
  {
    name: 'V-Guard VG 50 Voltage Stabilizer for Refrigerator (Up to 300L)',
    price: 1399,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'V-Guard',
    warranty: '5 Years Manufacturer Warranty',
    stock: 7,
    images: [
      'https://m.media-amazon.com/images/I/51rO0sJ+dHL.jpg',
      'https://m.media-amazon.com/images/I/51vY8qT3rVL.jpg'
    ],
    description: '• Tailored voltage stabilization for single and double door refrigerators up to 300 litres\n• Working range 130V to 290V input, providing safe voltage to compressor\n• Built-in thermal overload protection and initial time delay system\n• High-grade ABS cabinet with fail-safe circuit breaker'
  },

  // ── 4. VFD Drives & Control Panels (4 products) ──
  {
    name: 'Siemens SINAMICS V20 1.5 kW 3-Phase Variable Frequency Drive (Used)',
    price: 8200,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'Siemens',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61u9Z4t8QvL.jpg',
      'https://m.media-amazon.com/images/I/51oW8eY9kCL.jpg'
    ],
    description: '• Benchmarked pre-owned Siemens V20 VFD in pristine condition for industrial machines\n• Power rating: 1.5 kW (2.0 HP), 3-Phase 380V-480V input/output\n• Integrated operator panel (BOP) with easy parameter clone and multi-speed control\n• Built-in RS485/USS and Modbus RTU communication interfaces'
  },
  {
    name: 'L&T MK1 Direct On Line (DOL) 3-Phase Motor Starter (5 HP to 7.5 HP)',
    price: 2450,
    condition: 'new',
    categorySlug: 'vfd-control-panel',
    brand: 'L&T',
    warranty: '1 Year Manufacturer Warranty',
    stock: 5,
    images: [
      'https://m.media-amazon.com/images/I/61fW8uK9rQL.jpg',
      'https://m.media-amazon.com/images/I/51m-Z3v8qTL.jpg'
    ],
    description: '• Robust industrial DOL starter for 3-phase squirrel cage induction motors\n• Equipped with adjustable bimetallic thermal overload relay for phase failure safety\n• Deep drawn sheet steel enclosure with powder coating for dust & damp resistance\n• Silver cadmium oxide contacts provide long electrical and mechanical lifespan'
  },
  {
    name: 'Delta VFD-L Series 0.75kW 1HP Compact AC Motor Inverter Drive (Used)',
    price: 4900,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'Delta',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61k1q-w9eTL.jpg',
      'https://m.media-amazon.com/images/I/51y-Z8uK9rL.jpg'
    ],
    description: '• Refurbished Delta 1HP VFD drive, load-tested on conveyor & fan motors\n• 220V Single-phase input, 3-phase output with variable frequency 0.1 to 400Hz\n• Built-in EMI filter and potentiometer for instantaneous speed adjustment\n• Over-current, over-voltage, under-voltage, and thermal protection alarms'
  },
  {
    name: 'Automatic Water Level Controller Panel with Dry Run Sensor (Used)',
    price: 1850,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'Generic',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/61t1Y-m9qKL.jpg',
      'https://m.media-amazon.com/images/I/51r2R-v+9xL.jpg'
    ],
    description: '• Pre-owned smart automation control panel for overhead and underground water tanks\n• Magnetic float sensor inputs prevent dry-run damage and tank overflow\n• Auto / Manual operation selector with bright LED status indicators\n• Compatible with single-phase open-well and borewell submersible pump motors'
  },

  // ── 5. Electrical & Electronic Spares (4 products) ──
  {
    name: 'Schneider Electric Acti9 32A Double Pole (DP) C-Curve MCB',
    price: 620,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Schneider Electric',
    warranty: '2 Years Manufacturer Warranty',
    stock: 12,
    images: [
      'https://m.media-amazon.com/images/I/51v1y-w9qTL.jpg',
      'https://m.media-amazon.com/images/I/51rO0sJ+dHL.jpg'
    ],
    description: '• Acti9 iC60N miniature circuit breaker with 10kA breaking capacity\n• C-curve magnetic tripping mechanism ideal for inductive loads and heavy motors\n• VisiTrip red indicator clearly identifies faulty circuits instantly\n• Bi-connect terminals allow simultaneous connection of busbars and feeder cables'
  },
  {
    name: 'Havells Crabtree 63A 4-Pole Residual Current Circuit Breaker (RCCB)',
    price: 2850,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Havells',
    warranty: '2 Years Manufacturer Warranty',
    stock: 6,
    images: [
      'https://m.media-amazon.com/images/I/61s8zW-xUPL.jpg',
      'https://m.media-amazon.com/images/I/51m-Z3v8qTL.jpg'
    ],
    description: '• Essential life-safety device protecting humans against electric shock and leakage current\n• 63 Amps 4-Pole rating with high sensitivity 30mA earth leakage trip threshold\n• Test push-button for periodic functional safety checks\n• Fire retardant polycarbonate casing conforming to IS 12640 / IEC 61008-1'
  },
  {
    name: 'Polycab 2.5 Sq.mm Single Core Copper FR Wire (90 Metre Coil)',
    price: 2350,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Polycab',
    warranty: 'Manufacturer Quality Assurance',
    stock: 10,
    images: [
      'https://m.media-amazon.com/images/I/61k1q-w9eTL.jpg',
      'https://m.media-amazon.com/images/I/51v1y-w9qTL.jpg'
    ],
    description: '• 100% Electrolytic grade annealed bare copper conductor with >101% IACS conductivity\n• Flame Retardant (FR) PVC insulation resists ignition and limits fire spread\n• Voltage grade up to and including 1100V, certified IS 694\n• Ideal for residential and commercial conduit wiring for lighting & power sockets'
  },
  {
    name: 'L&T 32A 4-Pole Rotary Manual Changeover Switch (Used)',
    price: 1400,
    condition: 'used',
    categorySlug: 'electrical-electronic-spares',
    brand: 'L&T',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/51wWfP3tKxL.jpg',
      'https://m.media-amazon.com/images/I/41-Jb7mH8BL.jpg'
    ],
    description: '• Inspected and contact-cleaned manual changeover switch for mains / generator transfer\n• 32A 4-Pole enclosed in heavy-gauge metal box with padlockable rotary handle\n• Quick-make and quick-break mechanism minimizes contact arcing and pitting\n• Complete with neutral disconnection and phase isolation'
  }
];

async function addBatch() {
  console.log('Connecting to databases...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jai-ambe-integrator');
  const mongoDb = mongoose.connection.db;

  const mongoCategories = await mongoDb.collection('categories').find({}).toArray();
  const mongoCatMap = {};
  mongoCategories.forEach(c => { mongoCatMap[c.slug] = c._id; });

  const firestoreCategorySnap = await getDocs(collection(db, 'categories'));
  const firestoreCatMap = {};
  firestoreCategorySnap.forEach(d => { firestoreCatMap[d.data().slug] = d.id; });

  let mongoCount = 0;
  let firestoreCount = 0;

  for (const p of newBatchProducts) {
    const mongoCatId = mongoCatMap[p.categorySlug] || mongoCategories[0]._id;
    const firestoreCatId = firestoreCatMap[p.categorySlug] || Object.values(firestoreCatMap)[0];

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
      __v: 0,
    };

    const existing = await mongoDb.collection('products').findOne({ name: p.name });
    if (!existing) {
      await mongoDb.collection('products').insertOne(mongoDoc);
      mongoCount++;
      console.log(`[MongoDB #${mongoCount}] [${p.condition.toUpperCase()}] Added: ${p.name.substring(0, 45)}... (₹${p.price})`);
    } else {
      console.log(`[MongoDB] Exists: ${p.name.substring(0, 40)}`);
    }

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
        updatedAt: Timestamp.now(),
      });
      firestoreCount++;
      console.log(`[Firestore #${firestoreCount}] Added`);
    } catch (fErr) {
      console.warn(`[Firestore] Warning on ${p.name.substring(0, 30)}:`, fErr.message);
    }
  }

  const finalTotal = await mongoDb.collection('products').countDocuments();
  console.log(`\n🎉 BATCH COMPLETED!`);
  console.log(`Newly Added: ${mongoCount} products`);
  console.log(`Total Products Now in Catalog: ${finalTotal}`);
  process.exit(0);
}

addBatch().catch(err => {
  console.error('Fatal error during batch add:', err);
  process.exit(1);
});
