import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'JAYAMBE INTEGRATORS',
    },
    ownerName: {
      type: String,
      default: 'Er. Anand',
    },
    designation: {
      type: String,
      default: 'EXTC ENGINEER',
    },
    ownerPhoto: {
      type: String,
      default: '/Anand.jpeg',
    },
    email: {
      type: String,
      default: 'anandp4994@gmail.com',
    },
    phone: {
      type: String,
      default: '+91 8879430925',
    },
    whatsapp: {
      type: String,
      default: '918879430925',
    },
    address: {
      type: String,
      default: 'Office: Mahavir Nagar, Shop No. 28, Navapur Road, Near to UCO Bank, Boisar (W).',
    },
    workingHours: {
      type: String,
      default: 'Monday - Saturday: 9:00 AM - 8:00 PM, Sunday: Closed',
    },
    banners: {
      type: [String],
      default: [],
    },
    enableReviews: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
