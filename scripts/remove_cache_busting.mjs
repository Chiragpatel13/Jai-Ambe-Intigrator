import fs from 'fs';

// 1. Clean app/api/settings/route.js
let sRoute = fs.readFileSync('app/api/settings/route.js', 'utf8');
sRoute = sRoute.replace("export const dynamic = 'force-dynamic';", 'export const revalidate = 60;');
fs.writeFileSync('app/api/settings/route.js', sRoute, 'utf8');
console.log('✓ app/api/settings/route.js');

// 2. Clean app/api/categories/route.js
let cRoute = fs.readFileSync('app/api/categories/route.js', 'utf8');
cRoute = cRoute.replace("export const dynamic = 'force-dynamic';", 'export const revalidate = 60;');
fs.writeFileSync('app/api/categories/route.js', cRoute, 'utf8');
console.log('✓ app/api/categories/route.js');

// 3. Clean app/api/products/route.js
let pRoute = fs.readFileSync('app/api/products/route.js', 'utf8');
pRoute = pRoute.replace("export const dynamic = 'force-dynamic';", 'export const revalidate = 30;');
fs.writeFileSync('app/api/products/route.js', pRoute, 'utf8');
console.log('✓ app/api/products/route.js');

// 4. Clean client files of ?t=Date.now() and { cache: 'no-store' }
const clientFiles = [
  'app/page.js',
  'app/categories/page.js',
  'app/contact/page.js',
  'app/products/page.js',
  'components/Navbar.js',
  'components/Footer.js'
];

for (const file of clientFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\?t=\$\{Date\.now\(\)\}/g, '');
    content = content.replace(/,?\s*\{\s*cache:\s*['"]no-store['"]\s*\}/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Cleaned ${file}`);
  }
}
