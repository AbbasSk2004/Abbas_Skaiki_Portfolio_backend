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
    client: { type: String, trim: true },
    role: { type: String, trim: true },
    year: { type: Number },
    challenge: { type: String, trim: true },
    solution: { type: String, trim: true },
    stack: { type: [String], default: [] },
    liveUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    images: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
