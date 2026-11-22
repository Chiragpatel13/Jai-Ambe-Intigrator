import fs from 'fs';

// 1. Patch lib/dbFirebase.js
let dbFirebase = fs.readFileSync('lib/dbFirebase.js', 'utf8');

// Add isMongoUsable definition after imports
if (!dbFirebase.includes('isMongoUsable')) {
  dbFirebase = dbFirebase.replace(
    "import { normalizeProduct, normalizeProductList, normalizeImages, normalizeGalleryItem } from '../utils/imageHelper.js';",
    `import { normalizeProduct, normalizeProductList, normalizeImages, normalizeGalleryItem } from '../utils/imageHelper.js';

export const isMongoUsable = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    return false;
  }
  return true;
};`
  );

  // Replace FIRESTORE_TIMEOUT_MS = 10000
  dbFirebase = dbFirebase.replace('const FIRESTORE_TIMEOUT_MS = 10000;', 'const FIRESTORE_TIMEOUT_MS = 4000;');

  // Skip seeding in production
  dbFirebase = dbFirebase.replace(
    'async function ensureSeeded() {',
    'async function ensureSeeded() {\n  if (process.env.VERCEL || process.env.NODE_ENV === \'production\') return;'
  );

  // Replace process.env.MONGODB_URI checks
  dbFirebase = dbFirebase.replaceAll('if (process.env.MONGODB_URI) {', 'if (isMongoUsable()) {');

  // Add caching to getSettings
  dbFirebase = dbFirebase.replace(
    'export async function getSettings() {',
    `export async function getSettings() {
  const cached = cacheGet('settings');
  if (cached) return cached;`
  );

  dbFirebase = dbFirebase.replace(
    'const result = { _id: doc._id.toString(), id: doc._id.toString(), ...doc, banners: normalizeImages(doc.banners || []) };',
    'const result = { _id: doc._id.toString(), id: doc._id.toString(), ...doc, banners: normalizeImages(doc.banners || []) }; cacheSet(\'settings\', result);'
  );

  dbFirebase = dbFirebase.replace(
    'return docToObj(snap);',
    'const resObj = docToObj(snap); if (resObj) cacheSet(\'settings\', resObj); return resObj;'
  );

  fs.writeFileSync('lib/dbFirebase.js', dbFirebase, 'utf8');
  console.log('✓ Patched lib/dbFirebase.js');
}

// 2. Patch app/api/settings/route.js
let settingsRoute = fs.readFileSync('app/api/settings/route.js', 'utf8');
settingsRoute = settingsRoute.replace(
  "'Cache-Control': 'no-store, max-age=0, must-revalidate',",
  "'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',"
);
fs.writeFileSync('app/api/settings/route.js', settingsRoute, 'utf8');
console.log('✓ Patched app/api/settings/route.js');

// 3. Patch app/api/categories/route.js
let catRoute = fs.readFileSync('app/api/categories/route.js', 'utf8');
if (!catRoute.includes('s-maxage=60')) {
  catRoute = catRoute.replace(
    'return NextResponse.json({ success: true, categories });',
    "return NextResponse.json({ success: true, categories }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });"
  );
  fs.writeFileSync('app/api/categories/route.js', catRoute, 'utf8');
  console.log('✓ Patched app/api/categories/route.js');
}

// 4. Patch app/api/products/route.js
let prodRoute = fs.readFileSync('app/api/products/route.js', 'utf8');
if (!prodRoute.includes('s-maxage=30')) {
  prodRoute = prodRoute.replace(
    `    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    });`,
    `    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });`
  );
  fs.writeFileSync('app/api/products/route.js', prodRoute, 'utf8');
  console.log('✓ Patched app/api/products/route.js');
}

// 5. Patch hooks/useLiveSync.js
let liveSync = fs.readFileSync('hooks/useLiveSync.js', 'utf8');
liveSync = liveSync.replace('intervalMs = 12000', 'intervalMs = 60000');
fs.writeFileSync('hooks/useLiveSync.js', liveSync, 'utf8');
console.log('✓ Patched hooks/useLiveSync.js');

// 6. Patch app/page.js for parallel fetchHomeData
let pageJs = fs.readFileSync('app/page.js', 'utf8');
const oldFetchBlock = `  const fetchHomeData = async (showLoader = true) => {
    try {
      await fetchSettings();
      await fetchTestimonials();

      const categoriesRes = await fetch('/api/categories', { cache: 'no-store' });
      const categoriesData = await categoriesRes.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      const featuredRes = await fetch('/api/products?featured=true&limit=8', { cache: 'no-store' });
      const featuredData = await featuredRes.json();
      if (featuredData.success) {
        setFeaturedProducts(featuredData.products);
      }

      const newRes = await fetch('/api/products?condition=new&limit=4&daysLimit=30', { cache: 'no-store' });
      const newData = await newRes.json();
      if (newData.success) {
        setNewProducts(newData.products);
      }

      const usedRes = await fetch('/api/products?condition=used&limit=4', { cache: 'no-store' });
      const usedData = await usedRes.json();
      if (usedData.success) {
        setUsedProducts(usedData.products);
      }

      const totalRes = await fetch('/api/products?limit=1', { cache: 'no-store' });
      const totalData = await totalRes.json();
      if (totalData.success && typeof totalData.total === 'number') {
        setTotalProducts(totalData.total);
      }
    } catch (err) {
      console.warn('Error fetching home page data:', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };`;

const newFetchBlock = `  const fetchHomeData = async (showLoader = true) => {
    try {
      const [
        settingsRes,
        testimonialsRes,
        categoriesRes,
        featuredRes,
        newRes,
        usedRes,
        totalRes
      ] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/reviews/featured').catch(() => null),
        fetch('/api/categories').catch(() => null),
        fetch('/api/products?featured=true&limit=8').catch(() => null),
        fetch('/api/products?condition=new&limit=4&daysLimit=30').catch(() => null),
        fetch('/api/products?condition=used&limit=4').catch(() => null),
        fetch('/api/products?limit=1').catch(() => null)
      ]);

      const [
        settingsData,
        testimonialsData,
        categoriesData,
        featuredData,
        newData,
        usedData,
        totalData
      ] = await Promise.all([
        settingsRes ? settingsRes.json().catch(() => null) : null,
        testimonialsRes ? testimonialsRes.json().catch(() => null) : null,
        categoriesRes ? categoriesRes.json().catch(() => null) : null,
        featuredRes ? featuredRes.json().catch(() => null) : null,
        newRes ? newRes.json().catch(() => null) : null,
        usedRes ? usedRes.json().catch(() => null) : null,
        totalRes ? totalRes.json().catch(() => null) : null
      ]);

      if (settingsData?.success && settingsData.settings) {
        setSettings(settingsData.settings);
      }
      if (testimonialsData?.success && testimonialsData.reviews?.length > 0) {
        setTestimonials(testimonialsData.reviews);
      }
      if (categoriesData?.success) {
        setCategories(categoriesData.categories);
      }
      if (featuredData?.success) {
        setFeaturedProducts(featuredData.products);
      }
      if (newData?.success) {
        setNewProducts(newData.products);
      }
      if (usedData?.success) {
        setUsedProducts(usedData.products);
      }
      if (totalData?.success && typeof totalData.total === 'number') {
        setTotalProducts(totalData.total);
      }
    } catch (err) {
      console.warn('Error fetching home page data:', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };`;

if (pageJs.includes('await fetchSettings();')) {
  pageJs = pageJs.replace(oldFetchBlock, newFetchBlock);
  fs.writeFileSync('app/page.js', pageJs, 'utf8');
  console.log('✓ Patched app/page.js with parallel Promise.all');
}
