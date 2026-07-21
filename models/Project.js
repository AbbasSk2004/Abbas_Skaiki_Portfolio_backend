import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: { type: String, trim: true },
    tags: { type: [String], default: [] },
    role: { type: String, trim: true },
    year: { type: Number },
    challenge: { type: String, trim: true },
    solution: { type: String, trim: true },
    stack: { type: [String], default: [] },
    liveUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    // Dedicated cover image (card thumbnail / hero). Stored the same way as each
    // entry in `images`: a single Cloudinary secure_url string (see upload.js /
    // utils/cloudinary.js). Empty string when no cover has been set.
    coverImage: { type: String, trim: true, default: '' },
    // Gallery images shown on the case-study detail page. Cover lives separately
    // in `coverImage` above, so this is gallery-only.
    images: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
