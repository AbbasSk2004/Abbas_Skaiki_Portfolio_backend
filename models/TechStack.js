import mongoose from 'mongoose';

const techStackSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    // Prose description for capability-card style sections (Expertise). The
    // Expertise cards carry a title + paragraph rather than a discrete skill
    // list, so `description` holds that copy while `technologies` stays empty.
    description: { type: String, trim: true },
    // Name of the lucide icon the frontend card renders (e.g. 'Code2').
    icon: { type: String, trim: true },
    // Display order in the marquee / grid.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TechStack = mongoose.model('TechStack', techStackSchema);

export default TechStack;
