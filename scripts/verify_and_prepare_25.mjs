import fetch from 'node-fetch';

// Let's test an array of verified image URLs from reliable CDNs (m.media-amazon.com, images.unsplash.com, etc.)
const candidates = [
  // CCTV & Intercom (5 items)
  {
    name: 'Hikvision ColorVu 2MP Full-Time Color Night Vision Bullet Camera',
    url: 'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg' // working Amazon camera image
  },
  {
    name: 'CP PLUS 16-Channel 4K Ultra HD Network Video Recorder (NVR)',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dahua 2MP Full HD Starlight Eyeball IP Camera with PoE (Used)',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Godrej Eagle-I Pro Wireless Home Security Alarm & Motion System',
    url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Realtime RS20 Biometric Fingerprint & RFID Time Attendance Machine (Used)',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },

  // Microwave & Induction (5 items)
  {
    name: 'LG 28L Charcoal Convection Microwave Oven with Diet Fry',
    url: 'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg' // working Amazon microwave image
  },
  {
    name: 'Morphy Richards 25 L Convection Microwave with 200 Auto Menus (Used)',
    url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Crompton InstaDelight 2000W Induction Cooktop',
    url: 'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg' // working Amazon induction cooktop
  },
  {
    name: 'Wonderchef Power 1800W Induction Cooktop with Dual Sensor',
    url: 'https://m.media-amazon.com/images/I/61xm5RZx0+L.jpg' // working Amazon induction cooktop
  },
  {
    name: 'Havells Insta Cook ET-X 1900W Induction Cooktop (Used)',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  },

  // Geyser & Stabilizer (5 items)
  {
    name: 'AO Smith SDS-GREEN SERIES-015 15L Storage Water Heater Geyser',
    url: 'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg' // working Amazon geyser image
  },
  {
    name: 'Bajaj New Shakti Neo 15L Plus Storage Water Heater Geyser (Used)',
    url: 'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg' // working Amazon geyser image
  },
  {
    name: 'V-Guard V400 Prime High Performance AC Stabilizer',
    url: 'https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg' // working Amazon stabilizer image
  },
  {
    name: 'Luminous ToughX 5kVA Mainline Automatic Voltage Stabilizer (Used)',
    url: 'https://m.media-amazon.com/images/I/61boyZ18neL.jpg' // working Amazon stabilizer image
  },
  {
    name: 'Havells Adonia R 25L Smart Storage Geyser with Digital Display',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  },

  // VFD Drives & Control Panels (5 items)
  {
    name: 'ABB ACS355 2.2kW Machinery Drive Variable Frequency Inverter (Used)',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Schneider Electric Altivar 12 (ATV12) 0.75kW 1-Phase to 3-Phase VFD',
    url: 'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg' // working Amazon VFD image
  },
  {
    name: 'L&T FAS-1 3-Phase Fully Automatic Star-Delta Starter Panel (Used)',
    url: 'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg' // working Amazon starter panel image
  },
  {
    name: 'BCH 10 HP Submersible Pump Star-Delta Starter Panel (Used)',
    url: 'https://m.media-amazon.com/images/I/51NQOVIi7rL.jpg' // working Amazon controller image
  },
  {
    name: 'Danfoss VLT Micro Drive FC 51 1.5kW Compact Industrial Inverter',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },

  // Electrical & Electronic Spares (5 items)
  {
    name: 'Legrand RX3 63A 30mA 2-Pole Earth Leakage Circuit Breaker (ELCB)',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Schneider Electric EasyPact CVS 100A 3-Pole 25kA MCCB (Used)',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Polycab 6 Sq.mm Single Core Industrial Heavy Duty Copper Cable (90m)',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Havells Fabio Modular 20A Heavy Duty Water Heater & AC Switch',
    url: 'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
  },
  {
    name: 'L&T MNX 18 Contactor 3-Pole with 220V AC Operating Coil (Used)',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  }
];

async function testAll() {
  console.log(`Checking ${candidates.length} URLs...`);
  let passed = 0;
  let failed = 0;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    try {
      const res = await fetch(c.url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        console.log(`[PASS] ${i + 1}. [HTTP ${res.status}] ${c.name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${i + 1}. [HTTP ${res.status}] ${c.name} - ${c.url}`);
        failed++;
      }
    } catch (err) {
      console.error(`[ERR] ${i + 1}. ${c.name} - ${err.message}`);
      failed++;
    }
  }
  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}

testAll();
