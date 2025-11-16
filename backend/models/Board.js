const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Kanban', 'Scrum', 'Other'], // Example types
    default: 'Kanban',
  },
  columns: [
    {
      name: { type: String, required: true },
      status: { type: String, required: true }, // Corresponds to issue status
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
