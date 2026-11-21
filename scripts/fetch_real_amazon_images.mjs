import fetch from 'node-fetch';
import fs from 'fs';

// Specific high-accuracy query definitions for each of the 53 products
const productQueries = [
  { id: '6afae69781e1ccc58cc83ff9', name: 'Hikvision 4-Camera CCTV Security Kit with Intercom', q: 'Hikvision 4 Camera CCTV Security Kit' },
  { id: '6afae69781e1ccc58cc83ffc', name: 'CP PLUS 8-Channel Full HD Security System', q: 'CP PLUS 8 Channel CCTV Security Kit DVR' },
  { id: '6afae69781e1ccc58cc83ffd', name: 'Panasonic Wired Video Door Phone System', q: 'Panasonic Video Door Phone' },
  { id: '6afae69781e1ccc58cc83ffe', name: 'IFB 23L Convection Microwave Oven', q: 'IFB 23L Convection Microwave Oven' },
  { id: '6afae69781e1ccc58cc84000', name: 'Philips Viva Collection 2100-Watt Induction Cooktop', q: 'Philips Viva Collection 2100 Watt Induction Cooktop' },
  { id: '6afae69781e1ccc58cc84001', name: 'Samsung 20L Solo Microwave Oven (Used)', q: 'Samsung 20L Solo Microwave Oven' },
  { id: '6afae69781e1ccc58cc84002', name: 'Gelco Automatic Voltage Stabilizer 5kVA', q: 'Gelco Voltage Stabilizer' },
  { id: '6afae69781e1ccc58cc84004', name: 'Crompton Solarium Neo 15L Storage Geyser', q: 'Crompton Solarium Neo 15L Geyser' },
  { id: '6afae69781e1ccc58cc84006', name: 'Havells Monza EC 10L Storage Geyser (Used)', q: 'Havells Monza EC 10L Geyser' },
  { id: '6afae69781e1ccc58cc84007', name: 'Delta VFD Drive 2.2kW 3-Phase', q: 'Delta VFD Drive 2.2kW' },
  { id: '6afae69781e1ccc58cc84009', name: 'Siemens SINAMICS V20 0.75kW VFD Drive', q: 'Siemens SINAMICS V20 VFD Drive' },
  { id: '6afae69781e1ccc58cc8400a', name: 'Schneider Electric Three-Phase Motor Starter Panel (Used)', q: 'Schneider Electric DOL Motor Starter' },
  { id: '6afae69781e1ccc58cc8400b', name: 'Polycab 2.5 Sq.mm Single Core FR PVC Insulated Cable', q: 'Polycab 2.5 Sq mm copper wire 90m' },
  { id: '6afae69781e1ccc58cc8400c', name: 'L&T 16 Amp Three Pole MCB (Pack of 4)', q: 'L&T 16 Amp Triple Pole MCB' },
  { id: '6afae69781e1ccc58cc8400d', name: 'Havells 30 Amp DP Main Switch (Used)', q: 'Havells 32A DP Switch with indicator' },
  { id: '6b015507d853dae83eaf0fa3', name: 'Hikvision DS-2CE56D0T-IPECO 2MP Indoor Dome CCTV Camera', q: 'Hikvision DS-2CE56D0T dome camera' },
  { id: '6b015509d853dae83eaf0fa4', name: 'Dahua 4 Channel 1080P Full HD Pentabrid DVR (DH-XVR1B04-I)', q: 'Dahua 4 Channel DVR DH-XVR1B04' },
  { id: '6b01550ad853dae83eaf0fa5', name: 'Godrej SeeThru RE 7 Video Door Phone with Two-Way Intercom (Used)', q: 'Godrej SeeThru Video Door Phone' },
  { id: '6b01550cd853dae83eaf0fa7', name: 'D-Link DGS-1008A 8-Port Gigabit Unmanaged Switch (Used)', q: 'D-Link DGS-1008A 8-Port Gigabit Switch' },
  { id: '6b015513d853dae83eaf0faa', name: 'IFB 20L Convection Microwave Oven (20SC2, Metallic Silver) (Used)', q: 'IFB 20L Convection Microwave Oven' },
  { id: '6b015513d853dae83eaf0fad', name: 'Racold Pronto Pro 3 Litres 3kW Instant Water Heater Geyser', q: 'Racold Pronto Pro 3L Instant Geyser' },
  { id: '6b01551fd853dae83eaf0fb1', name: 'Siemens SINAMICS V20 1.5 kW 3-Phase Variable Frequency Drive (Used)', q: 'Siemens SINAMICS V20 1.5kW VFD' },
  { id: '6b015524d853dae83eaf0fb5', name: 'Schneider Electric Acti9 32A Double Pole (DP) C-Curve MCB', q: 'Schneider Electric Acti9 32A Double Pole MCB' },
  { id: '6b015529d853dae83eaf0fb7', name: 'Polycab 2.5 Sq.mm Single Core Copper FR Wire (90 Metre Coil)', q: 'Polycab 2.5 Sq mm copper wire 90m red' },
  { id: '6b01552bd853dae83eaf0fb8', name: 'L&T 32A 4-Pole Rotary Manual Changeover Switch (Used)', q: 'L&T 32A 4-Pole Rotary Changeover Switch' },
  { id: '6b01594f6515188ab56201cf', name: 'Hikvision ColorVu 2MP Full-Time Color Night Vision Bullet Camera', q: 'Hikvision ColorVu 2MP Bullet Camera' },
  { id: '6b0159506515188ab56201d0', name: 'CP PLUS 16-Channel 4K Ultra HD Network Video Recorder (NVR)', q: 'CP PLUS 16 Channel 4K NVR' },
  { id: '6b0159506515188ab56201d1', name: 'Dahua 2MP Full HD Starlight Eyeball IP Camera with PoE (Used)', q: 'Dahua 2MP Eyeball IP Camera PoE' },
  { id: '6b0159516515188ab56201d2', name: 'Godrej Eagle-I Pro Wireless Home Security Alarm & Motion System', q: 'Godrej Eagle-I Pro Wireless Alarm System' },
  { id: '6b0159516515188ab56201d3', name: 'Realtime RS20 Biometric Fingerprint & RFID Time Attendance Machine (Used)', q: 'Realtime RS20 Biometric Fingerprint Attendance' },
  { id: '6b0159516515188ab56201d4', name: 'LG 28L Charcoal Convection Microwave Oven with Diet Fry', q: 'LG 28L Charcoal Convection Microwave Oven' },
  { id: '6b0159546515188ab56201d5', name: 'Morphy Richards 25 L Convection Microwave with 200 Auto Menus (Used)', q: 'Morphy Richards 25L Convection Microwave Oven' },
  { id: '6b01595a6515188ab56201d8', name: 'Havells Insta Cook ET-X 1900W Induction Cooktop (Used)', q: 'Havells Insta Cook ET-X Induction Cooktop' },
  { id: '6b01596c6515188ab56201dd', name: 'Havells Adonia R 25L Smart Storage Geyser with Digital Display', q: 'Havells Adonia R 25L Storage Geyser' },
  { id: '6b01596d6515188ab56201de', name: 'ABB ACS355 2.2kW Machinery Drive Variable Frequency Inverter (Used)', q: 'ABB ACS355 VFD Inverter Drive' },
  { id: '6b01596d6515188ab56201df', name: 'Schneider Electric Altivar 12 (ATV12) 0.75kW 1-Phase to 3-Phase VFD', q: 'Schneider Electric Altivar 12 ATV12 VFD' },
  { id: '6b01596e6515188ab56201e2', name: 'Danfoss VLT Micro Drive FC 51 1.5kW Compact Industrial Inverter', q: 'Danfoss VLT Micro Drive FC 51 VFD' },
  { id: '6b0159726515188ab56201e3', name: 'Legrand RX3 63A 30mA 2-Pole Earth Leakage Circuit Breaker (ELCB)', q: 'Legrand RX3 63A 30mA 2 Pole ELCB' },
  { id: '6b0159746515188ab56201e4', name: 'Schneider Electric EasyPact CVS 100A 3-Pole 25kA MCCB (Used)', q: 'Schneider Electric EasyPact CVS 100A MCCB' },
  { id: '6b0159746515188ab56201e5', name: 'Polycab 6 Sq.mm Single Core Industrial Heavy Duty Copper Cable (90m)', q: 'Polycab 6 Sq mm copper wire 90m' },
  { id: '6b0159746515188ab56201e6', name: 'Havells Fabio Modular 20A Heavy Duty Water Heater & AC Switch', q: 'Havells Fabio 20A AC Switch' },
  { id: '6b0159746515188ab56201e7', name: 'L&T MNX 18 Contactor 3-Pole with 220V AC Operating Coil (Used)', q: 'L&T MNX 18 Contactor 3-Pole' },
  { id: '6b0190fc4cd67c7c8b4d8ca1', name: 'CP PLUS 2.4MP Full HD Cosmic Dome Camera (CP-VAC-D24L2)', q: 'CP PLUS 2.4MP Cosmic Dome Camera' },
  { id: '6b0191004cd67c7c8b4d8ca2', name: 'Hikvision 8-Channel Turbo HD DVR (DS-7208HGHI-K1) (Used)', q: 'Hikvision 8 Channel Turbo HD DVR' },
  { id: '6b0191014cd67c7c8b4d8ca3', name: 'Secureye S-FB4K Biometric Face & Fingerprint Attendance Machine', q: 'Secureye Biometric Attendance Machine' },
  { id: '6b0191024cd67c7c8b4d8ca4', name: 'Panasonic 27L Convection Microwave Oven with 360 Degree Heat (NN-CT645BFDG)', q: 'Panasonic 27L Convection Microwave Oven' },
  { id: '6b0191034cd67c7c8b4d8ca6', name: 'Bajaj 17L Solo Microwave Oven with 30-min Timer (1701 MT)', q: 'Bajaj 17L Solo Microwave Oven 1701' },
  { id: '6b0191074cd67c7c8b4d8caa', name: 'Delta MS300 Series 1.5kW Compact Vector Control VFD (Used)', q: 'Delta MS300 VFD Inverter Drive' },
  { id: '6b0191094cd67c7c8b4d8cac', name: 'Fuji Electric FRENIC-Mini 0.75kW 3-Phase Compact Inverter Drive (Used)', q: 'Fuji Electric FRENIC Mini VFD' },
  { id: '6b01910b4cd67c7c8b4d8cad', name: 'Havells Euro-II 40A Double Pole Isolator Switch', q: 'Havells Euro-II 40A Isolator Switch' },
  { id: '6b01910c4cd67c7c8b4d8cae', name: 'Siemens 3TF30 3-Pole 9A Power Contactor with 230V AC Coil (Used)', q: 'Siemens 3TF30 contactor 3 pole' },
  { id: '6b01910d4cd67c7c8b4d8caf', name: 'Finolex 4 Sq.mm Industrial Multi-Strand Copper Wire (90m Roll)', q: 'Finolex 4 sq mm copper wire 90m' },
  { id: '6b01910d4cd67c7c8b4d8cb0', name: 'Schneider Electric Easy9 63A 4-Pole 30mA RCCB (Used)', q: 'Schneider Electric Easy9 63A 4-Pole RCCB' }
];

async function getImagesForQuery(q) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const imgMatches = [...html.matchAll(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/gi)];
    const verified = [];
    for (const m of imgMatches) {
      const clean = m[1].replace(/\._[A-Za-z0-9_,+-]+_\./, '.');
      // Verify clean URL with HEAD
      try {
        const head = await fetch(clean, { method: 'HEAD' });
        if (head.ok && !verified.includes(clean)) {
          verified.push(clean);
          if (verified.length >= 2) break;
        }
      } catch (e) {}
    }
    return verified;
  } catch (err) {
    return [];
  }
}

async function processAll() {
  console.log(`Starting real Amazon image search for ${productQueries.length} products...`);
  const results = [];

  for (let i = 0; i < productQueries.length; i++) {
    const item = productQueries[i];
    console.log(`[${i + 1}/${productQueries.length}] Searching: "${item.q}"...`);
    const imgs = await getImagesForQuery(item.q);
    if (imgs.length > 0) {
      console.log(`   Found ${imgs.length} verified images: ${imgs[0]}`);
      results.push({ id: item.id, name: item.name, images: imgs });
    } else {
      console.warn(`   WARNING: No image found for "${item.q}"`);
      results.push({ id: item.id, name: item.name, images: [] });
    }
    // Small delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 600));
  }

  fs.writeFileSync('scripts/amazon_replacement_images.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nCompleted! Saved results to scripts/amazon_replacement_images.json`);
}

processAll();
