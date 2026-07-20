import mongoose from 'mongoose';

// -----------------------------------------------------------------------------
// Approach is a SINGLETON section, not a collection of steps.
//
// Previous shape stored one document per step, each carrying its own image —
// but the public ApproachSection renders ONE section visual and simply maps over
// the step text. The schema now matches that reality:
//   - `approachImage`  ONE section-level image (Cloudinary URL or asset path)
//   - `steps[]`         ordered, text-only sub-documents (no per-step media)
// -----------------------------------------------------------------------------

// A single process phase. Text only — the section image lives at the top level.
const approachStepSchema = new mongoose.Schema(
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
  },
  { _id: false } // steps are positional data, not independently addressable docs
);

const approachSchema = new mongoose.Schema(
  {
    // Section-level visual shared by every step. Holds a Cloudinary URL.
    approachImage: { type: String, trim: true, default: '' },
    // Ordered process phases (text only).
    steps: { type: [approachStepSchema], default: [] },
  },
  { timestamps: true }
);

const Approach = mongoose.model('Approach', approachSchema);

export default Approach;
