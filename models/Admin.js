import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide admin username.'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide admin password.'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
