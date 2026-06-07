import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import Category from '../models/Category';
import Product from '../models/Product';
import Setting from '../models/Setting';
import WorkGallery from '../models/WorkGallery';

export async function seedDatabase() {
  try {
    // 1. Seed Admin Account if empty
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await Admin.create({
        username,
        password: hashedPassword,
      });
      console.log(`[SEED] Admin account created: ${username}`);
    }

    // 2. Seed Default Settings if empty
    const settingsCount = await Setting.countDocuments();
    let currentSettings = null;
    if (settingsCount === 0) {
      currentSettings = await Setting.create({
        shopName: 'JAYAMBE INTEGRATORS',
        ownerName: 'Er. Anand',
        designation: 'EXTC ENGINEER',
        ownerPhoto: '/Anand.jpeg',
        email: 'anandp4994@gmail.com',
        phone: '+91 8879430925',
        whatsapp: '918879430925', // Format: country code + number without plus
        address: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
        workingHours: 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed',
        banners: [
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        ],
      });
      console.log('[SEED] Default settings initialized.');
    } else {
      // Auto-migration update: if settings are old, update them
      const existing = await Setting.findOne({});
      if (existing) {
        let needsSave = false;
        if (existing.shopName !== 'JAYAMBE INTEGRATORS' || existing.phone !== '+91 8879430925' || existing.address !== 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).') {
          existing.shopName = 'JAYAMBE INTEGRATORS';
          existing.ownerName = 'Er. Anand';
          existing.designation = 'EXTC ENGINEER';
          existing.email = 'anandp4994@gmail.com';
          existing.phone = '+91 8879430925';
          existing.whatsapp = '918879430925';
          existing.address = 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).';
          existing.workingHours = 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed';
          needsSave = true;
        }
        if (!existing.ownerPhoto) {
          existing.ownerPhoto = '/Anand.jpeg';
          needsSave = true;
        }
        if (needsSave) {
          await existing.save();
          console.log('[SEED] Existing settings migrated to JAYAMBE INTEGRATORS.');
        }
      }
    }

    // 3. Seed/Update Categories
    const categoryCount = await Category.countDocuments();
    let createdCategories = [];
    
    // Define the new categories based on the visiting card
    const targetCategories = [
      { name: 'CCTV & Intercom Systems', slug: 'cctv-intercom' },
      { name: 'Microwave & Induction', slug: 'microwave-induction' },
      { name: 'Geyser & Stabilizer', slug: 'geyser-stabilizer' },
      { name: 'VFD Drives & Control Panels', slug: 'vfd-control-panel' },
      { name: 'Electrical & Electronic Spares', slug: 'electrical-electronic-spares' },
    ];

    // Check if we have the old set of categories (e.g. laptops-computers)
    const hasOldCategories = await Category.findOne({ slug: 'laptops-computers' });
    if (hasOldCategories) {
      console.log('[SEED] Old categories detected, performing migration...');
      // Delete old products and categories so we start fresh with the correct business focus
      await Product.deleteMany({});
      await Category.deleteMany({});
      createdCategories = await Category.insertMany(targetCategories);
      console.log('[SEED] Categories migrated to electrical and electronics.');
    } else if (categoryCount === 0) {
      createdCategories = await Category.insertMany(targetCategories);
      console.log('[SEED] Default electronic categories seeded.');
    } else {
      createdCategories = await Category.find({});
    }

    // 4. Seed Sample Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const catCCTV = createdCategories.find(c => c.slug === 'cctv-intercom')?._id || createdCategories[0]._id;
      const catMicrowave = createdCategories.find(c => c.slug === 'microwave-induction')?._id || createdCategories[1]._id;
      const catGeyser = createdCategories.find(c => c.slug === 'geyser-stabilizer')?._id || createdCategories[2]._id;
      const catVFD = createdCategories.find(c => c.slug === 'vfd-control-panel')?._id || createdCategories[3]._id;
      
      const sampleProducts = [
        {
          name: 'Hikvision 4-Camera CCTV Security Kit with Intercom',
          price: 16500,
          condition: 'new',
          description: 'Full HD 1080P Hikvision security system. Kit contains 2 Dome cameras (indoor), 2 Bullet cameras (outdoor weatherproof), 4-Channel Turbo HD DVR, 1TB surveillance HDD, intercom handset and wiring setup. High-quality security integration for homes and offices.',
          images: [
            'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          ],
          category: catCCTV,
          stock: 5,
          availability: true,
          featured: true,
        },
        {
          name: 'Delta VFD Drive 2.2kW 3-Phase',
          price: 18900,
          condition: 'new',
          description: 'Delta Electronics Variable Frequency Drive (VFD) 2.2kW 3HP 3-Phase AC motor controller. Excellent control performance, built-in PLC, robust design for industrial automation. Authentic Delta product with manufacturer warranty.',
          images: [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
          ],
          category: catVFD,
          stock: 3,
          availability: true,
          featured: true,
        },
        {
          name: 'Gelco Automatic Voltage Stabilizer 5kVA',
          price: 8500,
          condition: 'new',
          description: 'Gelco Electronics digital automatic voltage stabilizer for mains supply. Built-in high/low cut-off, time delay, overload protection. Premium copper winding for long life. Best protection for household electronics and geysers.',
          images: [
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          ],
          category: catGeyser,
          stock: 4,
          availability: true,
          featured: true,
        },
        {
          name: 'Crompton 15L Storage Geyser (Used - Excellent)',
          price: 4800,
          condition: 'used',
          description: 'Crompton Greaves 15-liter storage geyser. Fully serviced, cleaned, and checked for heating element resistance and leakage by our engineers. Excellent working condition with 3 months shop warranty.',
          images: [
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          ],
          category: catGeyser,
          stock: 2,
          availability: true,
          featured: false,
        },
      ];
      await Product.insertMany(sampleProducts);
      console.log('[SEED] Default sample products seeded.');
    }

    // 5. Seed Showcase Gallery Items if empty
    const galleryCount = await WorkGallery.countDocuments();
    if (galleryCount === 0 || galleryCount === 4) {
      // Re-seed to match the electrical/electronics nature of the business
      await WorkGallery.deleteMany({});
      const sampleWorks = [
        {
          title: 'CCTV Security Setup at Boisar Industrial Zone',
          description: 'Designed and deployed an 8-camera outdoor high-definition IP camera network with PoE switch and 4TB NVR for continuous 30-day recording. Remote viewing enabled on client mobile devices.',
          mediaUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'Industrial VFD Control Panel Wiring',
          description: 'Structured cabling, installation of Delta VFD drives, stabilizer, and neat wire routing inside a dual-motor industrial control panel cabinet for a local manufacturing unit.',
          mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'Residential Geyser & Electrical Troubleshooting',
          description: 'Diagnosed and fixed heating element wiring issues, automatic thermostats, and installed Gelco voltage stabilizers for a residential complex in Boisar West.',
          mediaUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'Intercom System & CCTV Setup',
          description: 'Configured and networked 12-channel audio/video intercom system alongside security cameras for a commercial office outlet near UCO Bank.',
          mediaUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'image',
        },
      ];
      await WorkGallery.insertMany(sampleWorks);
      console.log('[SEED] Showcase gallery items updated to electrical and electronics.');
    }
  } catch (err) {
    console.error('[SEED] Database seeding error:', err);
  }
}
