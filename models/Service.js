import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
    },
    icon: { type: String, trim: true },
    // Short mono tags rendered on the service row (e.g. NEXT.JS, REACT).
    tags: { type: [String], default: [] },
    // Hover/hero preview image. Will eventually hold a Cloudinary URL.
    serviceImage: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
