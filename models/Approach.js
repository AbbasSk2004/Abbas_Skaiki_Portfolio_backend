import mongoose from 'mongoose';

const approachSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: [true, 'Step number is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    // Section visual. Will eventually hold a Cloudinary URL.
    approachImage: { type: String, trim: true },
  },
  { timestamps: true }
);

const Approach = mongoose.model('Approach', approachSchema);

export default Approach;
