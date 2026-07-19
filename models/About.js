import mongoose from 'mongoose';

// About is intended as a single-document collection describing the site owner.
const aboutSchema = new mongoose.Schema(
  {
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
    },
    resumeLink: { type: String, trim: true },
    // Portrait image. Will eventually hold a Cloudinary URL.
    aboutImage: { type: String, trim: true },
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const About = mongoose.model('About', aboutSchema);

export default About;
