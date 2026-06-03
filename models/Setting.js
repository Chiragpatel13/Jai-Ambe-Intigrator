import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'Jai Ambe Intigrator',
    },
    phone: {
      type: String,
      default: '+91 99999 99999',
    },
    whatsapp: {
      type: String,
      default: '+91 99999 99999',
    },
    address: {
      type: String,
      default: 'Boisar, Palghar, Maharashtra',
    },
    workingHours: {
      type: String,
      default: 'Monday - Saturday: 9:00 AM - 8:00 PM',
    },
    banners: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
