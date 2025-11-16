const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Uncommented
const { updateProjectMetricsAndInsights } = require('../services/insightService');

// Helper function to check if user is part of the project
const checkProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.owner.toString() === userId.toString() || project.members.some(member => member.toString() === userId.toString());
};

// @desc    AI-assisted creation of an issue
// @route   POST /api/issues/ai-create
// @access  Private
exports.aiCreateIssue = async (req, res) => {
  try {
    const { textPrompt, projectId } = req.body;
    const reporter = req.user._id;

    if (!textPrompt || !projectId) {
      return res.status(400).json({ message: 'Text prompt and project ID are required' });
    }

    // Check if the reporter is part of the project
    if (!(await checkProjectMembership(projectId, reporter))) {
      return res.status(403).json({ message: 'Not authorized to create issues in this project' });
    }

    // --- Gemini API Integration (LIVE) ---
    let aiParsedIssueData;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Given the following user request, extract the issue details into a JSON object.
      The JSON object should have the following fields:
      {
        "title": "string",
        "description": "string",
        "priority": "Low" | "Medium" | "High" | "Highest",
        "type": "Story" | "Task" | "Bug" | "Epic",
        "status": "To Do" | "In Progress" | "Done" | "Blocked" | "Review",
        "dueDate": "YYYY-MM-DD" | null,
        "assignee": "User's Name or Email" | null // Try to identify an assignee if mentioned
      }

      If a field is not explicitly mentioned, use a reasonable default.
      User Request: "${textPrompt}"

      Return ONLY the JSON object.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Attempt to parse the JSON string from the LLM response
      aiParsedIssueData = JSON.parse(text.replace(/```json|```/g, '').trim());

    } catch (llmError) {
      console.error('Error calling Gemini API or parsing response:', llmError);
      // Fallback to basic parsing or return an error
      aiParsedIssueData = {
        title: textPrompt.substring(0, 50) + '...',
        description: textPrompt,
        priority: 'Medium',
        type: 'Task',
        status: 'To Do',
        dueDate: null,
        assignee: null,
      };
    }
    // --- End Gemini API Integration ---

    // Validate and prepare data for issue creation
    const { title, description, priority, type, status, dueDate, assignee } = aiParsedIssueData;

    // **FIXED LOGIC:** Find actual assignee ID if a name/email was provided by AI
    let actualAssigneeId = null;
    if (assignee) { // 'assignee' here is the name/email string from the AI
      try {
        // Search for the user by email or name (case-insensitive)
        const foundUser = await User.findOne({
          $or: [
            { email: { $regex: new RegExp(`^${assignee}$`, 'i') } },
            { name: { $regex: new RegExp(`^${assignee}$`, 'i') } }
          ]
        });

        // Check if user was found AND is a member of the project
        if (foundUser && (await checkProjectMembership(projectId, foundUser._id))) {
          actualAssigneeId = foundUser._id;
        } else {
          console.log(`AI suggested assignee "${assignee}" not found or not a project member.`);
        }
      } catch (userSearchError) {
        console.error('Error searching for assignee:', userSearchError);
      }
    }

    const newIssue = new Issue({
      title: title || textPrompt.substring(0, 50) + '...',
      description: description || textPrompt,
      project: projectId,
      type: type || 'Task',
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignee: actualAssigneeId, // Use the ID we found
      reporter,
      dueDate,
    });

    await newIssue.save(); // Save the issue to the database
    res.status(201).json(newIssue); // Return the saved issue object
  } catch (error) {
    console.error('Error in AI create issue endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate subtasks for an issue using AI
// @route   POST /api/issues/:id/generate-subtasks
// @access  Private
exports.generateSubtasks = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is part of the project the issue belongs to
    if (!(await checkProjectMembership(issue.project, userId))) {
      return res.status(403).json({ message: 'Not authorized to generate subtasks for this issue' });
    }

    // --- Gemini API Integration (LIVE) ---
    let suggestedSubtasks;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Given the following issue title and description, suggest a list of relevant sub-tasks.
      Return the sub-tasks as a JSON array of strings, like ["Subtask 1", "Subtask 2"].
      Issue Title: "${issue.title}"
      Issue Description: "${issue.description}"

      Return ONLY the JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      suggestedSubtasks = JSON.parse(text.replace(/```json|```/g, '').trim());

    } catch (llmError) {
      console.error('Error calling Gemini API or parsing response for subtasks:', llmError);
      // Fallback to a generic suggestion
      suggestedSubtasks = [`Review "${issue.title}"`, 'Break down into smaller tasks', 'Plan implementation details'];
    }
    // --- End Gemini API Integration ---

    res.status(200).json({ subtasks: suggestedSubtasks });
  } catch (error) {
    console.error('Error in AI generate subtasks endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res) => {
  try {
    const { title, description, project, board, type, status, priority, assignee, parent_issue, dueDate } = req.body;
    const reporter = req.user._id; // Assuming req.user is populated by auth middleware

    if (!title || !project || !type || !status || !priority) {
      return res.status(400).json({ message: 'Please enter all required fields: title, project, type, status, priority' });
    }

    // Check if the reporter is part of the project
    if (!(await checkProjectMembership(project, reporter))) {
      return res.status(403).json({ message: 'Not authorized to create issues in this project' });
    }

    // Check if assignee is part of the project (if provided)
    if (assignee && !(await checkProjectMembership(project, assignee))) {
      return res.status(400).json({ message: 'Assignee is not a member of this project' });
    }

    const issue = new Issue({
      title,
      description,
      project,
      board,
      type,
      status,
      priority,
      assignee,
      reporter,
      parent_issue,
      dueDate,
    });

    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all issues for a specific project
// @route   GET /api/projects/:projectId/issues
// @access  Private
exports.getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if the user is part of the project
    if (!(await checkProjectMembership(projectId, req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to view issues in this project' });
    }

    const issues = await Issue.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('project', 'name')
      .populate('board', 'name')
      .populate('parent_issue', 'title');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues by project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an issue's status
// @route   PUT /api/issues/:id/status
// @access  Private
exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is part of the project the issue belongs to
    if (!(await checkProjectMembership(issue.project, req.user._id))) {
      return res.status(400, { messgae: 'Not authorized to update this issue' });
    }

    issue.status = status;
    await issue.save();

    // After updating issue status, update project metrics and insights
    await updateProjectMetricsAndInsights(issue.project);

    res.status(200).json(issue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign an issue to a user
// @route   PUT /api/issues/:id/assignee
// @access  Private
exports.assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body; // Expecting assigneeId in the request body

    if (!assigneeId) {
      return res.status(400).json({ message: 'Assignee ID is required' });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is part of the project the issue belongs to
    if (!(await checkProjectMembership(issue.project, req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to assign issues in this project' });
    }

    // Check if the assigneeId is a valid user and is part of the project
    const newAssignee = await User.findById(assigneeId);
    if (!newAssignee) {
      return res.status(400).json({ message: 'Assignee user not found' });
    }
    if (!(await checkProjectMembership(issue.project, assigneeId))) {
      return res.status(400).json({ message: 'Assignee is not a member of this project' });
    }

    issue.assignee = assigneeId;
    await issue.save();
    res.status(200).json(issue);
  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single issue by ID
// @route   GET /api/issues/:id
// @access  Private
exports.getIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email')
      .populate('project', 'name')
      .populate('board', 'name')
      .populate('parent_issue', 'title');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is part of the project the issue belongs to
    if (!(await checkProjectMembership(issue.project, req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to view this issue' });
    }

    res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an issue by ID
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is the reporter or project owner
    const project = await Project.findById(issue.project);
    const isReporter = issue.reporter.toString() === userId.toString();
    const isProjectOwner = project.owner.toString() === userId.toString();

    if (!isReporter && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    res.status(200).json({ message: 'Issue removed' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
};