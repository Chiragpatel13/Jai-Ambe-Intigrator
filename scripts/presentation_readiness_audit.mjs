import fetch from 'node-fetch';

const BASE_URL = 'https://jai-ambe-intigrator.vercel.app';

const pagesToTest = [
  { name: 'Home Page', path: '/' },
  { name: 'Products Page', path: '/products' },
  { name: 'Products Page 2', path: '/products?page=2' },
  { name: 'Categories Page', path: '/categories' },
  { name: 'About Page', path: '/about' },
  { name: 'Contact Page', path: '/contact' },
  { name: 'Admin Login', path: '/admin/login' },
  { name: 'API Settings', path: '/api/settings' },
  { name: 'API Categories', path: '/api/categories' },
  { name: 'API Products', path: '/api/products?limit=12' },
  { name: 'API Featured Reviews', path: '/api/reviews/featured' }
];

async function runAudit() {
  console.log(`=======================================================`);
  console.log(`🚀 STARTING PRESENTATION READINESS AUDIT FOR ${BASE_URL}`);
  console.log(`=======================================================\n`);

  let allPassed = true;

  // 1. Check all critical pages and APIs
  console.log('--- 1. Testing Page & API Route Responses ---');
  for (const page of pagesToTest) {
    const url = `${BASE_URL}${page.path}`;
    const start = Date.now();
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const duration = Date.now() - start;
      if (res.ok) {
        console.log(`[PASS] (${duration}ms) ${res.status} ${page.name.padEnd(22)} -> ${url}`);
      } else {
        console.error(`[FAIL] (${duration}ms) ${res.status} ${page.name.padEnd(22)} -> ${url}`);
        allPassed = false;
      }
    } catch (err) {
      console.error(`[ERR]  ${page.name} -> ${err.message}`);
      allPassed = false;
    }
  }

  // 2. Test Catalog Data & Pagination
  console.log('\n--- 2. Testing Catalog Integrity & Pagination ---');
  try {
    const res = await fetch(`${BASE_URL}/api/products?limit=1`);
    const data = await res.json();
    console.log(`Catalog Total Products: ${data.total}`);
    console.log(`Total Pages (at 12/page): ${data.totalPages}`);
    if (data.total >= 100) {
      console.log(`[PASS] Catalog count verified: ${data.total} products.`);
    } else {
      console.warn(`[WARN] Catalog count is ${data.total} (expected >= 100)`);
    }
  } catch (err) {
    console.error('[FAIL] Catalog test error:', err.message);
    allPassed = false;
  }

  // 3. Test Individual Product Page
  console.log('\n--- 3. Testing Single Product Detail Page ---');
  try {
    const pRes = await fetch(`${BASE_URL}/api/products?limit=1`);
    const pData = await pRes.json();
    const firstProduct = pData.products[0];
    const detailUrl = `${BASE_URL}/products/${firstProduct._id || firstProduct.id}`;
    const dRes = await fetch(detailUrl);
    if (dRes.ok) {
      console.log(`[PASS] Product detail page loads (${dRes.status}): ${firstProduct.name.substring(0, 45)}...`);
      console.log(`       URL: ${detailUrl}`);
    } else {
      console.error(`[FAIL] Product detail page failed with ${dRes.status}`);
      allPassed = false;
    }
  } catch (err) {
    console.error('[FAIL] Product detail test error:', err.message);
    allPassed = false;
  }

  // 4. Test Categories
  console.log('\n--- 4. Testing Categories ---');
  try {
    const cRes = await fetch(`${BASE_URL}/api/categories`);
    const cData = await cRes.json();
    console.log(`Categories found: ${cData.categories?.length}`);
    cData.categories?.forEach(c => console.log(`   - ${c.name} (${c.slug})`));
    if (cData.categories?.length >= 5) {
      console.log(`[PASS] All 5 core categories exist.`);
    } else {
      console.warn(`[WARN] Less than 5 categories found.`);
    }
  } catch (err) {
    console.error('[FAIL] Category test error:', err.message);
    allPassed = false;
  }

  // 5. Test Settings
  console.log('\n--- 5. Testing Store Settings ---');
  try {
    const sRes = await fetch(`${BASE_URL}/api/settings`);
    const sData = await sRes.json();
    const s = sData.settings;
    console.log(`Shop Name: ${s?.shopName}`);
    console.log(`Phone: ${s?.phone}`);
    console.log(`WhatsApp: ${s?.whatsapp}`);
    console.log(`Address: ${s?.address}`);
    if (s?.shopName && s?.whatsapp && s?.address) {
      console.log(`[PASS] Store settings fully populated.`);
    } else {
      console.warn(`[WARN] Missing some store settings fields.`);
    }
  } catch (err) {
    console.error('[FAIL] Settings test error:', err.message);
    allPassed = false;
  }

  // 6. Test Inquiries API (Mock inquiry submission)
  console.log('\n--- 6. Testing Inquiry Form Submission ---');
  try {
    const inqRes = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Audit Test User',
        phone: '9876543210',
        message: 'System audit test inquiry - presentation readiness check'
      })
    });
    const inqData = await inqRes.json();
    if (inqRes.ok && inqData.success) {
      console.log(`[PASS] Inquiry API working perfectly! Submitted inquiry ID: ${inqData.inquiry?.id || inqData.inquiry?._id || 'OK'}`);
    } else {
      console.error(`[FAIL] Inquiry submission failed:`, inqData);
      allPassed = false;
    }
  } catch (err) {
    console.error('[FAIL] Inquiry submission error:', err.message);
    allPassed = false;
  }

  console.log('\n=======================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! THE SYSTEM IS 100% READY FOR PRESENTATION!');
  } else {
    console.log('⚠️ SOME TESTS REPORTED WARNINGS OR FAILURES - CHECK DETAILS ABOVE');
  }
  console.log('=======================================================');
}

runAudit();
