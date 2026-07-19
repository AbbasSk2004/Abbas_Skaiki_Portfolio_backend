import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    icon: { type: String, trim: true },
  },
  { timestamps: true }
);

const SocialLink = mongoose.model('SocialLink', socialLinkSchema);

export default SocialLink;
