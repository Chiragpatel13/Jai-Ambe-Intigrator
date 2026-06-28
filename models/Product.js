import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name.'],
      trim: true,
    },
    price: {
      type: Number,
      required: false,
      min: [0, 'Price cannot be negative.'],
      default: 0,
    },
    condition: {
      type: String,
      required: [true, 'Please specify product condition (new or used).'],
      enum: ['new', 'used'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description.'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category.'],
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock count.'],
      min: [0, 'Stock cannot be negative.'],
      default: 1,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    warranty: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Boisar',
    },
    reviews: {
      type: [
        new mongoose.Schema(
          {
            name: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true },
          },
          { timestamps: true }
        )
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
