const Insight = require('../models/Insight');
const Project = require('../models/Project');
const Issue = require('../models/Issue');
const User = require('../models/User');
const moment = require('moment');

// Mock LLM interaction for insight generation
const mockGenerateInsight = (analysisResult) => {
  let insightText = "Project health is good.";
  let severity = "Low";

  if (analysisResult.riskySprints.length > 0) {
    insightText = `Sprint(s) ${analysisResult.riskySprints.join(', ')} are at risk due to ${analysisResult.riskySprints.length} overdue issues.`;
    severity = "High";
  } else if (analysisResult.bottleneckUsers.length > 0) {
    insightText = `User(s) ${analysisResult.bottleneckUsers.map(u => u.name).join(', ')} might be bottlenecks with ${analysisResult.bottleneckUsers.length} high-priority issues assigned.`;
    severity = "Medium";
  } else if (analysisResult.stuckIssuesCount > 0) {
    insightText = `There are ${analysisResult.stuckIssuesCount} issues stuck in 'To Do' for too long.`;
    severity = "Medium";
  }

  return { insightText, severity };
};

// This function simulates a daily cron job
exports.generatePredictiveInsights = async () => {
  console.log('Running daily predictive insights generation...');
  try {
    const activeProjects = await Project.find({}); // Fetch all projects for analysis

    for (const project of activeProjects) {
      const issues = await Issue.find({ project: project._id }).populate('assignee', 'name');

      // --- Mock Analysis Logic ---
      const analysisResult = {
        riskySprints: [], // Placeholder for sprint IDs
        bottleneckUsers: [],
        stuckIssuesCount: 0,
      };

      const now = moment();
      const userIssueCounts = {};
      const userOverdueCounts = {};

      issues.forEach(issue => {
        // Mock: Identify risky sprints (e.g., issues overdue)
        if (issue.dueDate && moment(issue.dueDate).isBefore(now) && issue.status !== 'Done') {
          // For simplicity, we'll just add project ID as a risky sprint indicator
          if (!analysisResult.riskySprints.includes(project.name)) { // Using project name as a mock sprint identifier
            analysisResult.riskySprints.push(project.name);
          }
        }

        // Mock: Identify stuck issues (e.g., in 'To Do' for > 7 days)
        if (issue.status === 'To Do' && moment(issue.createdAt).add(7, 'days').isBefore(now)) {
          analysisResult.stuckIssuesCount++;
        }

        // Mock: Identify bottleneck users
        if (issue.assignee) {
          const assigneeId = issue.assignee._id.toString();
          userIssueCounts[assigneeId] = (userIssueCounts[assigneeId] || 0) + 1;
          if (issue.priority === 'High' || issue.priority === 'Highest') {
            userOverdueCounts[assigneeId] = (userIssueCounts[assigneeId] || 0) + 1;
          }
        }
      });

      // Filter users who have more than 5 high-priority issues
      for (const userId in userOverdueCounts) {
        if (userOverdueCounts[userId] > 5) {
          const user = await User.findById(userId).select('name');
          if (user) {
            analysisResult.bottleneckUsers.push(user);
          }
        }
      }

      // --- Mock LLM Interaction ---
      const { insightText, severity } = mockGenerateInsight(analysisResult);

      // Save the insight
      const newInsight = new Insight({
        projectId: project._id,
        sprintId: project.name, // Using project name as mock sprint ID
        type: 'Project Health',
        insightText,
        severity,
      });
      await newInsight.save();
      console.log(`Insight generated for project ${project.name}: ${insightText}`);
    }
    console.log('Predictive insights generation complete.');
  } catch (error) {
    console.error('Error generating predictive insights:', error);
  }
};

// New function to update project metrics and insights on issue status change
exports.updateProjectMetricsAndInsights = async (projectId) => {
  try {
    const issues = await Issue.find({ project: projectId });
    const totalIssues = issues.length;
    const completedIssues = issues.filter(issue => issue.status === 'Done').length;

    let completionPercentage = 0;
    if (totalIssues > 0) {
      completionPercentage = (completedIssues / totalIssues) * 100;
    }

    // For now, let's just log this. In a real app, you might update the Project model
    // or create a new Insight document for project progress.
    console.log(`Project ${projectId} - Completion: ${completionPercentage.toFixed(2)}%`);

    // Example: Update a generic 'Project Progress' insight
    // Find an existing 'Project Progress' insight or create a new one
    let projectProgressInsight = await Insight.findOneAndUpdate(
      { projectId: projectId, type: 'Project Progress' },
      {
        insightText: `Project is ${completionPercentage.toFixed(0)}% complete.`,
        severity: completionPercentage === 100 ? 'Low' : (completionPercentage > 50 ? 'Medium' : 'High'),
        // You might want to add a 'value' field to Insight model for numerical metrics
      },
      { upsert: true, new: true } // Create if not found, return new document
    );
    console.log(`Updated Project Progress Insight for ${projectId}`);

  } catch (error) {
    console.error(`Error updating project metrics and insights for project ${projectId}:`, error);
  }
};

// In a real application, you would schedule this function to run daily using a cron job library.
// Example (using node-cron, if it could be installed):
// const cron = require('node-cron');
// cron.schedule('0 0 * * *', () => { // Runs every day at midnight
//   exports.generatePredictiveInsights();
// });
