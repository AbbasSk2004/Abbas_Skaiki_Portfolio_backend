import mongoose from 'mongoose';

// Hero/Header is a single-document collection driving the landing hero.
// Mirrors the static content currently hardcoded in HeroSection.tsx.
const heroSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    // Small mono label, e.g. "Creative Developer / Based in the Digital Realm".
    roleLabel: { type: String, trim: true },
    // The right-aligned intro paragraph.
    intro: { type: String, trim: true },
    // The rotated corner badge, e.g. "EST. 2024 / Portfolio".
    badge: { type: String, trim: true },
    // Portrait shown in the hero frame. Will eventually hold a Cloudinary URL.
    headerImage: { type: String, trim: true },
  },
  { timestamps: true }
);

const Hero = mongoose.model('Hero', heroSchema);

export default Hero;
