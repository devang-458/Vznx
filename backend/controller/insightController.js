const Insight = require('../models/Insight');

// @desc    Get all insights or insights for a specific project
// @route   GET /api/insights
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    const { projectId } = req.query; // Allow filtering by projectId

    let query = {};
    if (projectId) {
      query.projectId = projectId;
    }

    // Fetch insights, ordered by generatedAt (newest first)
    const insights = await Insight.find(query)
      .populate('projectId', 'name') // Populate project name
      .sort({ generatedAt: -1 });

    res.status(200).json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
