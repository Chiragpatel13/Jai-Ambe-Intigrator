import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact number.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message.'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
