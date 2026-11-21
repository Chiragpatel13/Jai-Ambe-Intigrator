import fetch from 'node-fetch';

async function findFuji() {
  const queries = [
    'Fuji Electric inverter',
    '3 phase VFD inverter drive 0.75kW',
    'AC drive inverter 1HP 3 phase'
  ];
  for (const q of queries) {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' } });
    const html = await res.text();
    const matches = [...html.matchAll(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/gi)];
    console.log(`Query "${q}" -> ${matches.length} matches`);
    if (matches.length > 0) {
      const clean = matches[0][1].replace(/\._[A-Za-z0-9_,+-]+_\./, '.');
      console.log('Top image:', clean);
      return clean;
    }
  }
}

findFuji();
