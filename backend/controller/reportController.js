const Issue = require('../models/Issue');
const Project = require('../models/Project');
const moment = require('moment');

// Helper function to check if user is part of the project
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.owner.toString() === userId.toString() || project.members.some(member => member.toString() === userId.toString());
};

// @desc    Get burndown chart data for a sprint
// @route   GET /api/reports/burndown/:projectId/:startDate/:endDate
// @access  Private
exports.getBurndownChartData = async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.params;
    const userId = req.user._id;

    // Validate dates
    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return res.status(400).json({ message: 'Invalid sprint start or end dates' });
    }

    // Check if the user is part of the project
    if (!(await checkProjectMembership(projectId, userId))) {
      return res.status(403).json({ message: 'Not authorized to view reports for this project' });
    }

    // Fetch all issues for the project within the sprint timeframe
    // For simplicity, we'll consider issues created before or during the sprint
    // and completed issues within the sprint.
    const issues = await Issue.find({
      project: projectId,
      createdAt: { $lte: end.endOf('day').toDate() }, // Issues created up to the end of the sprint
    }).select('status storyPoints createdAt'); // Select only necessary fields

    // Mock story points if not present in schema
    const issuesWithStoryPoints = issues.map(issue => ({
      ...issue.toObject(),
      storyPoints: issue.storyPoints || Math.floor(Math.random() * 8) + 1, // Mock 1-8 story points
    }));

    const burndownData = [];
    let currentDay = moment(start);
    let totalInitialStoryPoints = issuesWithStoryPoints.reduce((sum, issue) => sum + issue.storyPoints, 0);

    while (currentDay.isSameOrBefore(end, 'day')) {
      let remainingStoryPoints = 0;

      issuesWithStoryPoints.forEach(issue => {
        // If issue is not 'Done' by the end of the current day, count its story points
        if (issue.status !== 'Done' || moment(issue.updatedAt || issue.createdAt).isAfter(currentDay.endOf('day'))) {
          remainingStoryPoints += issue.storyPoints;
        }
      });

      burndownData.push({
        date: currentDay.format('YYYY-MM-DD'),
        remainingStoryPoints: remainingStoryPoints,
      });

      currentDay.add(1, 'day');
    }

    res.status(200).json(burndownData);
  } catch (error) {
    console.error('Error generating burndown chart data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
