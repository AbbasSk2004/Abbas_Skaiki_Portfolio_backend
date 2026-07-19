import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
    },
    avatar: { type: String, trim: true },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
