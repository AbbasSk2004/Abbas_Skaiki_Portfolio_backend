import mongoose from 'mongoose';

const drivenResultSchema = new mongoose.Schema(
  {
    // Numeric counter that animates on the frontend (e.g. 22, 98).
    value: { type: Number, required: [true, 'Value is required'] },
    // Optional decoration around the value, e.g. prefix '$' or suffix '+' / '%'.
    prefix: { type: String, default: '', trim: true },
    suffix: { type: String, default: '', trim: true },
    // Short caption under the counter, e.g. "PROJECTS", "CLIENT SATISFACTION".
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    // Supporting sentence shown beneath the label.
    description: { type: String, trim: true },
    // Controls display order in the metric grid.
    order: { type: Number, default: 0 },
    // Legacy free-text metric (kept optional for backward compatibility).
    metric: { type: String, trim: true },
    projectRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  { timestamps: true }
);

const DrivenResult = mongoose.model('DrivenResult', drivenResultSchema);

export default DrivenResult;
