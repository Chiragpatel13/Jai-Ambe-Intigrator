import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/amazon_replacement_images.json', 'utf8'));

console.log(`Checking ${data.length} replacement entries...`);
data.forEach((d, idx) => {
  console.log(`${idx + 1}. [${d.id}] "${d.name}"`);
  console.log(`   Images:`, d.images);
});
