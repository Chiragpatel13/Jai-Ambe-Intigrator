import fetch from 'node-fetch';

async function test() {
  const query = 'Schneider Electric Easy9 63A 4-Pole RCCB';
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  // Look for s-image tags
  const imgMatches = [...html.matchAll(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/gi)];
  console.log(`Query: "${query}" -> found ${imgMatches.length} search images.`);
  for (const m of imgMatches.slice(0, 3)) {
    const fullUrl = m[1].replace(/\._[A-Za-z0-9_,+-]+_\./, '.');
    console.log('Original thumb:', m[1]);
    console.log('Clean full-res:', fullUrl);
  }
}

test();
