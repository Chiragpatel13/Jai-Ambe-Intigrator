import fetch from 'node-fetch';

async function getAmazonImages(query) {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const imgMatches = [...html.matchAll(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/gi)];
  const cleanUrls = [];
  for (const m of imgMatches.slice(0, 3)) {
    const clean = m[1].replace(/\._[A-Za-z0-9_,+-]+_\./, '.');
    cleanUrls.push(clean);
  }
  return cleanUrls;
}

async function run() {
  const tests = [
    'Finolex 4 sq mm copper wire 90m',
    'Siemens 3TF30 contactor 3 pole',
    'Polycab 6 Sq mm copper wire 90m',
    'Polycab 2.5 Sq mm copper wire',
    'Legrand RX3 63A 30mA 2-Pole ELCB',
    'L&T MNX 18 Contactor 3-Pole'
  ];

  for (const t of tests) {
    const urls = await getAmazonImages(t);
    console.log(`Query: ${t} -> Found ${urls.length} images`);
    if (urls[0]) {
      const check = await fetch(urls[0], { method: 'HEAD' });
      console.log(`   Top URL: ${urls[0]} [HTTP ${check.status}]`);
    }
  }
}

run();
