import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one note per task per user
noteSchema.index({ taskId: 1, owner: 1 }, { unique: true });

export default mongoose.model('Note', noteSchema);
