import mongoose from 'mongoose';

const WorkGallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the work showcase.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      required: [true, 'Please provide a media URL (image or video).'],
    },
    mediaType: {
      type: String,
      required: [true, 'Please specify the media type (image or video).'],
      enum: ['image', 'video'],
      default: 'image',
    },
  },
  { timestamps: true }
);

export default mongoose.models.WorkGallery || mongoose.model('WorkGallery', WorkGallerySchema);
