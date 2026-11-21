import mongoose from 'mongoose';
import { db } from '../lib/firebase.js';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const new25Products = [
  // ── 1. CCTV & Intercom Systems (5 items) ──
  {
    name: 'Hikvision ColorVu 2MP Full-Time Color Night Vision Bullet Camera',
    price: 1950,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'Hikvision',
    warranty: '2 Years Manufacturer Warranty',
    stock: 9,
    images: [
      'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 2 MP full-time color camera with F1.0 super-aperture for vivid 24/7 color imaging\n• Up to 20 m warm light distance for bright night imaging in pitch dark\n• Water and dust resistant (IP67) metal enclosure for rugged outdoor security\n• 4 in 1 switchable video output (TVI/AHD/CVI/CVBS)'
  },
  {
    name: 'CP PLUS 16-Channel 4K Ultra HD Network Video Recorder (NVR)',
    price: 6800,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'CP PLUS',
    warranty: '2 Years Manufacturer Warranty',
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Supports up to 16 IP cameras with up to 8MP / 4K preview and playback\n• Smart H.265+ / H.264+ dual-stream decoding for reduced bandwidth and storage\n• Supports 2 SATA HDDs up to 16TB total storage capacity\n• Mobile viewing via gCMOB (Android / iOS) and intelligent AI perimeter tripwire detection'
  },
  {
    name: 'Dahua 2MP Full HD Starlight Eyeball IP Camera with PoE (Used)',
    price: 1650,
    condition: 'used',
    categorySlug: 'cctv-intercom',
    brand: 'Dahua',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg'
    ],
    description: '• Tested pre-owned commercial IP camera with starlight low-light sensitivity\n• Power over Ethernet (PoE 802.3af) for clean single-cable installation\n• 1080p @ 30fps smooth streaming with 30m Smart IR illumination\n• Heavy-duty IP67 weatherproof eyeball housing with 3-axis rotation'
  },
  {
    name: 'Godrej Eagle-I Pro Wireless Home Security Alarm & Motion System',
    price: 4999,
    condition: 'new',
    categorySlug: 'cctv-intercom',
    brand: 'Godrej',
    warranty: '1 Year Manufacturer Warranty',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg'
    ],
    description: '• Complete DIY wireless home security package with central hub, door sensor, and motion detector\n• GSM SIM card alert: automatically sends SMS and dials phone numbers when triggered\n• 110dB loud indoor siren to deter intruders and alert neighbors\n• Built-in battery backup ensures protection during power cuts'
  },
  {
    name: 'Realtime RS20 Biometric Fingerprint & RFID Time Attendance Machine (Used)',
    price: 2400,
    condition: 'used',
    categorySlug: 'cctv-intercom',
    brand: 'Realtime',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Fully tested office attendance machine with fingerprint scanner, RFID card reader, and PIN\n• Stores up to 1,000 fingerprint templates and 100,000 transaction records\n• USB flash drive Excel report export — plug & play without complex software\n• Clear 2.4-inch color LCD display with voice prompt response'
  },

  // ── 2. Microwave & Induction (5 items) ──
  {
    name: 'LG 28L Charcoal Convection Microwave Oven with Diet Fry',
    price: 18990,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'LG',
    warranty: '1 Year Comprehensive + 4 Years Magnetron Warranty',
    stock: 4,
    images: [
      'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 28L capacity ideal for large families; Charcoal Lighting Heater for authentic barbecue flavor\n• Diet Fry technology enables crispy dishes using up to 88% less oil\n• 301 Auto Cook menus including Indian cuisine, pasteurized milk, and rotis\n• Stainless steel cavity for even heat reflection and effortless cleaning'
  },
  {
    name: 'Morphy Richards 25 L Convection Microwave with 200 Auto Menus (Used)',
    price: 5900,
    condition: 'used',
    categorySlug: 'microwave-induction',
    brand: 'Morphy Richards',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg'
    ],
    description: '• Refurbished premium 25L convection microwave, fully sanitized and performance certified\n• Baking, grilling, roasting, and microwave combination modes\n• Digital jog dial controls with mirror finish door panel\n• Includes original turntable and stainless steel multi-level grill rack'
  },
  {
    name: 'Crompton InstaDelight 2000W Induction Cooktop',
    price: 2699,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Crompton',
    warranty: '1 Year Manufacturer Warranty',
    stock: 8,
    images: [
      'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg',
      'https://m.media-amazon.com/images/I/61xm5RZx0+L.jpg'
    ],
    description: '• High-power 2000W electromagnetic heating coil for lightning-fast boiling and cooking\n• Feather-touch controls with 7 Indian cooking presets (Roti, Dosa, Curry, Milk, Idli)\n• Voltage surge protection withstands Indian electrical variations\n• Durable crystal glass top panel with auto shut-off safety protection'
  },
  {
    name: 'Wonderchef Power 1800W Induction Cooktop with Dual Sensor',
    price: 1999,
    condition: 'new',
    categorySlug: 'microwave-induction',
    brand: 'Wonderchef',
    warranty: '1 Year Manufacturer Warranty',
    stock: 6,
    images: [
      'https://m.media-amazon.com/images/I/61xm5RZx0+L.jpg',
      'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg'
    ],
    description: '• 1800 Watt energy-efficient induction cooktop with smart dual sensor temperature regulation\n• Microcrystalline glass surface is heat-resistant and easy to wipe clean\n• Preset menus with manual power & timer adjustment from 120W to 1800W\n• Compact and portable design suitable for homes, hostels, and outdoor pantries'
  },
  {
    name: 'Havells Insta Cook ET-X 1900W Induction Cooktop (Used)',
    price: 1450,
    condition: 'used',
    categorySlug: 'microwave-induction',
    brand: 'Havells',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg'
    ],
    description: '• Inspected and bench-tested pre-owned 1900W induction cooktop in great condition\n• 8 auto cooking functions with variable temperature and wattage controls\n• Auto pan detection and dry boil cutoff protection\n• Heavy duty ceramic plate with responsive push-button interface'
  },

  // ── 3. Geyser & Stabilizer (5 items) ──
  {
    name: 'AO Smith SDS-GREEN SERIES-015 15L Storage Water Heater Geyser',
    price: 8999,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'AO Smith',
    warranty: '7 Years Tank Warranty + 2 Years Comprehensive',
    stock: 5,
    images: [
      'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg',
      'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg'
    ],
    description: '• Blue Diamond glass-lined tank providing 2x corrosion resistance against hard water\n• Energy-efficient BEE 5-star rating with custom PUF insulation\n• Rated for 8-bar pressure, ideal for high-rise residential buildings\n• Glass-coated incoloy heating element prevents limescale and extends life'
  },
  {
    name: 'Bajaj New Shakti Neo 15L Plus Storage Water Heater Geyser (Used)',
    price: 3650,
    condition: 'used',
    categorySlug: 'geyser-stabilizer',
    brand: 'Bajaj',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg',
      'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg'
    ],
    description: '• Certified refurbished 15L geyser with Titanium Armour and swirl flow technology\n• Pressure tested and descaled; brand-new heating coil and thermostat installed\n• 8 Bar pressure suitable for multi-storey apartments\n• Multiple safety systems including thermal cutout and safety valve'
  },
  {
    name: 'V-Guard V400 Prime High Performance AC Stabilizer',
    price: 2499,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'V-Guard',
    warranty: '3 Years Manufacturer Warranty',
    stock: 7,
    images: [
      'https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg',
      'https://m.media-amazon.com/images/I/61boyZ18neL.jpg'
    ],
    description: '• Specifically engineered for inverter & split ACs up to 1.5 Ton (12 Amp capacity)\n• Wide operating voltage range: 160V to 280V with intelligent time delay system\n• Advanced IC-based design ensures corrective voltage stabilization\n• High-temperature thermal overload protection prevents compressor burnout'
  },
  {
    name: 'Luminous ToughX 5kVA Mainline Automatic Voltage Stabilizer (Used)',
    price: 4900,
    condition: 'used',
    categorySlug: 'geyser-stabilizer',
    brand: 'Luminous',
    warranty: '6 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/61boyZ18neL.jpg',
      'https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg'
    ],
    description: '• Bench-tested pre-owned 5kVA mainline stabilizer capable of powering an entire 2BHK flat\n• Operating input range: 90V - 290V with fast relay-based automatic buck/boost\n• Digital voltage meter display for input & output voltage monitoring\n• Heavy-duty toroidal transformer with built-in bypass switch'
  },
  {
    name: 'Havells Adonia R 25L Smart Storage Geyser with Digital Display',
    price: 11400,
    condition: 'new',
    categorySlug: 'geyser-stabilizer',
    brand: 'Havells',
    warranty: '7 Years Tank + 4 Years Element Warranty',
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg'
    ],
    description: '• 25L digital water heater with temperature sensing color-changing LED indicator ring\n• Feroglas tech with single weld-line design for superior rust protection\n• Incoloy 800 glass-coated heating element for fast heating\n• Feather-touch temperature control buttons with child lock mode'
  },

  // ── 4. VFD Drives & Control Panels (5 items) ──
  {
    name: 'ABB ACS355 2.2kW Machinery Drive Variable Frequency Inverter (Used)',
    price: 11500,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'ABB',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg'
    ],
    description: '• Industrial grade 2.2kW (3 HP) 3-phase machinery inverter drive in excellent working condition\n• Sensorless vector control for precise motor torque and speed regulation\n• Built-in brake chopper and EMC filter suitable for industrial conveyors and mixers\n• Fully tested under load with standard assistant control panel keypad'
  },
  {
    name: 'Schneider Electric Altivar 12 (ATV12) 0.75kW 1-Phase to 3-Phase VFD',
    price: 8900,
    condition: 'new',
    categorySlug: 'vfd-control-panel',
    brand: 'Schneider Electric',
    warranty: '1 Year Manufacturer Warranty',
    stock: 4,
    images: [
      'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 0.75kW (1 HP) single-phase 200–240V input to 3-phase 230V output motor drive\n• Intuitive navigation wheel for fast parameter setup and configuration\n• Modbus communication port built-in for PLC & SCADA integration\n• High overload capability: 150% for 60 seconds; conformal coating on PCB'
  },
  {
    name: 'L&T FAS-1 3-Phase Fully Automatic Star-Delta Starter Panel (Used)',
    price: 6800,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'L&T',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg',
      'https://m.media-amazon.com/images/I/51NQOVIi7rL.jpg'
    ],
    description: '• Heavy-duty star-delta motor starter panel suitable for 15 HP to 25 HP industrial motors\n• Equipped with authentic L&T ML contactors and thermal bimetallic overload relay\n• Solid powder-coated sheet metal enclosure with Start/Stop push buttons\n• Rewired and tested with electronic star-to-delta transition timer'
  },
  {
    name: 'BCH 10 HP Submersible Pump Star-Delta Starter Panel (Used)',
    price: 4950,
    condition: 'used',
    categorySlug: 'vfd-control-panel',
    brand: 'BCH',
    warranty: '3 Months Shop Warranty',
    stock: 3,
    images: [
      'https://m.media-amazon.com/images/I/51NQOVIi7rL.jpg',
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
    ],
    description: '• Agricultural & industrial pump starter panel tested and tuned for 7.5 HP - 10 HP motors\n• Single phasing protection with auto-switch for voltage surge handling\n• Analog voltmeter and ammeter installed on front door for live reading\n• Moisture and dust resistant industrial enclosure'
  },
  {
    name: 'Danfoss VLT Micro Drive FC 51 1.5kW Compact Industrial Inverter',
    price: 10200,
    condition: 'new',
    categorySlug: 'vfd-control-panel',
    brand: 'Danfoss',
    warranty: '1 Year Manufacturer Warranty',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg'
    ],
    description: '• 1.5kW (2 HP) compact VFD drive with side-by-side book-style mounting\n• Coated PCBs resistant to harsh industrial environments and dust\n• Built-in RFI filter and automatic energy optimization (AEO) saves up to 10% energy\n• Removable LCP display keypad with copy-paste parameter feature'
  },

  // ── 5. Electrical & Electronic Spares (5 items) ──
  {
    name: 'Legrand RX3 63A 30mA 2-Pole Earth Leakage Circuit Breaker (ELCB)',
    price: 2450,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Legrand',
    warranty: '2 Years Manufacturer Warranty',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• High-sensitivity 30mA residual current circuit breaker protecting human life against electrocution\n• 63 Ampere 2-Pole rated for 240V AC domestic and light commercial distribution boards\n• Bi-connect terminals allow cable and busbar connection simultaneously\n• Certified to IS 12640-1 and IEC 61008-1 standards'
  },
  {
    name: 'Schneider Electric EasyPact CVS 100A 3-Pole 25kA MCCB (Used)',
    price: 3800,
    condition: 'used',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Schneider Electric',
    warranty: '3 Months Shop Warranty',
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Heavy-duty 100A Molded Case Circuit Breaker (MCCB) with 25kA breaking capacity\n• Adjustable thermal-magnetic trip unit (TMD) for precision overload and short-circuit protection\n• Tested and verified on primary injection bench; contacts in pristine condition\n• Suitable for main power distribution panels in workshops and commercial buildings'
  },
  {
    name: 'Polycab 6 Sq.mm Single Core Industrial Heavy Duty Copper Cable (90m)',
    price: 5200,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Polycab',
    warranty: 'Manufacturer Guarantee',
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
    ],
    description: '• 90-meter full length roll of 6.0 sq.mm multi-strand electrolytic grade pure copper wire\n• Flame Retardant (FR) PVC insulation resists high temperatures and self-extinguishes fire\n• Rated for high current loads up to 37 Amperes: ideal for AC, main meters, and machine supplies\n• 100% genuine with ISI mark (IS:694) and anti-counterfeit hologram'
  },
  {
    name: 'Havells Fabio Modular 20A Heavy Duty Water Heater & AC Switch',
    price: 340,
    condition: 'new',
    categorySlug: 'electrical-electronic-spares',
    brand: 'Havells',
    warranty: '5 Years Manufacturer Warranty',
    stock: 25,
    images: [
      'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• 20 Ampere heavy-duty 2-module switch with neon power indicator for geysers and ACs\n• Silver cadmium oxide contacts ensure spark-free switching and extended electrical life\n• Flame-retardant polycarbonate housing in arctic white glossy finish\n• Compatible with all standard modular switch plates'
  },
  {
    name: 'L&T MNX 18 Contactor 3-Pole with 220V AC Operating Coil (Used)',
    price: 950,
    condition: 'used',
    categorySlug: 'electrical-electronic-spares',
    brand: 'L&T',
    warranty: '3 Months Shop Warranty',
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
    ],
    description: '• Genuine L&T MNX 18 (18 Amp AC-3 rating) 3-Pole power contactor with 1 NO auxiliary contact\n• 220V/240V 50Hz AC operating coil, thoroughly tested for coil resistance and chattering\n• High mechanical and electrical endurance suitable for motor starters and capacitor banks\n• DIN rail or base mounting with screw terminals'
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

  for (let i = 0; i < new25Products.length; i++) {
    const p = new25Products[i];
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
