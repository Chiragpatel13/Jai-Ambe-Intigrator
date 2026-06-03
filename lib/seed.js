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
        shopName: 'Jai Ambe Intigrator',
        phone: '+91 98902 54321',
        whatsapp: '919890254321', // Format: country code + number without plus
        address: 'Shop No. 12, Ostwal Empire, Near Boisar Railway Station, Boisar East, Palghar, Maharashtra - 401501',
        workingHours: 'Monday - Saturday: 10:00 AM - 8:30 PM, Sunday: Closed',
        banners: [
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        ],
      });
      console.log('[SEED] Default settings initialized.');
    }

    // 3. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categories = [
        { name: 'Laptops & Computers', slug: 'laptops-computers' },
        { name: 'CCTV & Security Systems', slug: 'cctv-security' },
        { name: 'Printers & Copiers', slug: 'printers-copiers' },
        { name: 'Networking & Wifi Router', slug: 'networking' },
        { name: 'Computer Accessories', slug: 'accessories' },
      ];
      const createdCategories = await Category.insertMany(categories);
      console.log('[SEED] Default categories seeded.');

      // 4. Seed Sample Products if empty
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        const sampleProducts = [
          {
            name: 'Refurbished HP ProBook 440 G6',
            price: 24500,
            condition: 'used',
            description: 'Intel Core i5 8th Gen processor, 8GB DDR4 RAM, 256GB ultra-fast NVMe SSD, 14-inch HD Display, Windows 10 Pro pre-installed. Excellent cosmetic condition, fully checked and certified by our technicians. Includes 30 days shop warranty.',
            images: [
              'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1496181130204-7552cc14f1d0?auto=format&fit=crop&w=800&q=80',
            ],
            category: createdCategories[0]._id,
            stock: 3,
            availability: true,
            featured: true,
          },
          {
            name: 'Hikvision 4-Camera CCTV Security Kit',
            price: 15499,
            condition: 'new',
            description: 'Full HD 1080P Hikvision security system. Kit contains 2 Dome cameras (indoor), 2 Bullet cameras (outdoor weatherproof), 4-Channel Turbo HD DVR, 1TB Seagate Surveillance HDD, power supply adapters, and cables. Remote viewing setup included.',
            images: [
              'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
            ],
            category: createdCategories[1]._id,
            stock: 5,
            availability: true,
            featured: true,
          },
          {
            name: 'Epson L3210 EcoTank InkTank Printer',
            price: 13200,
            condition: 'new',
            description: 'Brand new Epson EcoTank L3210 multi-function printer (Print, Scan, Copy). Spill-free, error-free ink refilling mechanism with high-yield ink bottles. Best for home and small business office needs. 1-year manufacturer warranty.',
            images: [
              'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
            ],
            category: createdCategories[2]._id,
            stock: 2,
            availability: true,
            featured: false,
          },
          {
            name: 'Used Dell 24-inch IPS Professional Monitor',
            price: 6500,
            condition: 'used',
            description: 'Dell Professional Series P2419H monitor. 24-inch Full HD (1920x1080) resolution with IPS technology for wide viewing angles. Ultra-thin bezel design, height-adjustable stand, pivot, tilt, swivel. Clean screen panel with minor body scuffs.',
            images: [
              'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
            ],
            category: createdCategories[0]._id,
            stock: 4,
            availability: true,
            featured: false,
          },
        ];
        await Product.insertMany(sampleProducts);
        console.log('[SEED] Default sample products seeded.');
      }
    }

    // 5. Seed Showcase Gallery Items if empty
    const galleryCount = await WorkGallery.countDocuments();
    if (galleryCount === 0) {
      const sampleWorks = [
        {
          title: 'CCTV Security Setup at Boisar Industrial Zone',
          description: 'Designed and deployed an 8-camera outdoor high-definition IP camera network with PoE switch and 4TB NVR for continuous 30-day recording. Remote viewing enabled on client mobile devices.',
          mediaUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'Office Server Rack Cabinet Networking',
          description: 'Structured cabling, installation of Cat6 patch panels, Gigabit network switch configuration, and neat wire routing inside a 9U server rack cabinet for a corporate office client.',
          mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'High-End Gaming PC Build & Tuning',
          description: 'Custom assembly of Intel Core i9 processor, NVIDIA RTX GPU, liquid cooling radiator, and RGB fan routing. Stress-tested for peak thermal performance and framerate stability.',
          mediaUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
        {
          title: 'Corporate Office Printer Fleet Setup',
          description: 'Deployed and networked five Epson EcoTank InkTank printers across departments. Configured print-over-wifi and scan-to-email options for all employee workstations.',
          mediaUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
          mediaType: 'image',
        },
      ];
      await WorkGallery.insertMany(sampleWorks);
      console.log('[SEED] Sample showcase gallery items seeded.');
    }
  } catch (err) {
    console.error('[SEED] Database seeding error:', err);
  }
}
