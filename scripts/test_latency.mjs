import fetch from 'node-fetch';

async function testTimes() {
  const urls = [
    'https://jai-ambe-intigrator.vercel.app/',
    'https://jai-ambe-intigrator.vercel.app/api/settings',
    'https://jai-ambe-intigrator.vercel.app/api/categories',
    'https://jai-ambe-intigrator.vercel.app/api/products?limit=12',
    'https://jai-ambe-intigrator.vercel.app/products'
  ];
  for (const u of urls) {
    const start = Date.now();
    const res = await fetch(u, { headers: { 'Cache-Control': 'no-cache' } });
    const duration = Date.now() - start;
    console.log(`[${duration}ms] ${res.status} ${u}`);
  }
}
testTimes();
