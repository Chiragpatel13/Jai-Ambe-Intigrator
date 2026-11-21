import fetch from 'node-fetch';

const candidates = [
  // 1. CCTV & Intercom
  {
    name: 'CP PLUS 2.4MP Full HD Cosmic Dome Camera (CP-VAC-D24L2)',
    url: 'https://m.media-amazon.com/images/I/41sz0e6uGUL.jpg'
  },
  {
    name: 'Hikvision 8-Channel Turbo HD DVR (DS-7208HGHI-K1) (Used)',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Secureye S-FB4K Biometric Face & Fingerprint Attendance Machine',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },

  // 2. Microwave & Induction
  {
    name: 'Panasonic 27L Convection Microwave Oven with 360 Degree Heat (NN-CT645BFDG)',
    url: 'https://m.media-amazon.com/images/I/71lk7TX-jXL.jpg'
  },
  {
    name: 'Prestige Iris 2000W Induction Cooktop with Indian Menu (Used)',
    url: 'https://m.media-amazon.com/images/I/61FxcW9mxBL.jpg'
  },
  {
    name: 'Bajaj 17L Solo Microwave Oven with 30-min Timer (1701 MT)',
    url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
  },

  // 3. Geyser & Stabilizer
  {
    name: 'Crompton Arno Neo 15L 5-Star Storage Water Heater Geyser',
    url: 'https://m.media-amazon.com/images/I/81yqngFpv2L.jpg'
  },
  {
    name: 'Microtek EML5090 Automatic Mainline Stabilizer 90V-300V (Used)',
    url: 'https://m.media-amazon.com/images/I/71vqP7S2mAL.jpg'
  },
  {
    name: 'Orient Electric Enamour Prime 25L Glassline Storage Geyser',
    url: 'https://m.media-amazon.com/images/I/51RlcI-kNNL.jpg'
  },

  // 4. VFD Drives & Control Panels
  {
    name: 'Delta MS300 Series 1.5kW Compact Vector Control VFD (Used)',
    url: 'https://m.media-amazon.com/images/I/61tZrJctKoL.jpg'
  },
  {
    name: 'L&T Single Phase Submersible Pump Control Panel 1.5 HP (MU-G)',
    url: 'https://m.media-amazon.com/images/I/4122MxpD1aL.jpg'
  },
  {
    name: 'Fuji Electric FRENIC-Mini 0.75kW 3-Phase Compact Inverter Drive (Used)',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  },

  // 5. Electrical & Electronic Spares
  {
    name: 'Havells Euro-II 40A Double Pole Isolator Switch',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Siemens 3TF30 3-Pole 9A Power Contactor with 230V AC Coil (Used)',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Finolex 4 Sq.mm Industrial Multi-Strand Copper Wire (90m Roll)',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Schneider Electric Easy9 63A 4-Pole 30mA RCCB (Used)',
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
