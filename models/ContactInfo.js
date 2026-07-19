import mongoose from 'mongoose';

// ContactInfo is a single-document collection holding the site's contact
// details. Mirrors the values formerly hardcoded in ContactFooter.tsx.
const contactInfoSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    // Short availability / intro line shown near the contact block.
    availabilityNote: { type: String, trim: true },
    // References the SocialLink collection so contact + socials are managed
    // together. Populated on read (see contactController.getContactInfo).
    socialLinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialLink',
      },
    ],
  },
  { timestamps: true }
);

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);

export default ContactInfo;
