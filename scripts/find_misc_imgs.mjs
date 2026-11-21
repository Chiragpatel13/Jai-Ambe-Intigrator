import fetch from 'node-fetch';

async function findImages() {
  const list = [
    { name: 'speed_controller', q: 'AC Motor Speed Controller 220V 250W' },
    { name: 'havells_rccb', q: 'Havells Crabtree 63A 4 Pole RCCB' },
    { name: 'schneider_acti9', q: 'Schneider Electric Acti9 MCB double pole' },
    { name: 'star_delta', q: 'Star Delta Starter Panel 3 Phase 15 HP' }
  ];

  for (const item of list) {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(item.q)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' } });
    const html = await res.text();
    const m = [...html.matchAll(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/gi)];
    if (m.length > 0) {
      const clean = m[0][1].replace(/\._[A-Za-z0-9_,+-]+_\./, '.');
      console.log(`[${item.name}] -> ${clean}`);
    }
  }
}

findImages();
