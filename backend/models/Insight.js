const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sprintId: { // Placeholder for sprint ID, could be ref to a Sprint model later
    type: String,
    default: 'N/A',
  },
  type: {
    type: String,
    required: true,
    enum: ['Sprint Risk', 'User Bottleneck', 'Project Health', 'Other'],
    default: 'Project Health',
  },
  insightText: {
    type: String,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
}, { timestamps: true });

module.exports = mongoose.model('Insight', insightSchema);
