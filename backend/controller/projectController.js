const Project = require('../models/Project');
const User = require('../models/User'); // Assuming User model is needed for owner/members
const Task = require('../models/Task');
const debug = require('../config/debug')('projectController');

// A more realistic placeholder for the LLM API call
const getAIResponse = async (prompt) => {
  console.log('Sending prompt to LLM:', prompt);

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return a professional, structured list of architectural tasks
  const mockTasks = {
    tasks: [
      { title: 'Initial Client Consultation', description: 'Meet with the client to discuss project goals, budget, and requirements.', priority: 'High' },
      { title: 'Site Analysis and Selection', description: 'Evaluate potential sites, including zoning, environmental factors, and accessibility.', priority: 'High' },
      { title: 'Feasibility Study', description: 'Assess the viability of the project, including financial, technical, and legal aspects.', priority: 'High' },
      { title: 'Schematic Design', description: 'Develop preliminary design concepts, including floor plans, elevations, and site layout.', priority: 'Medium' },
      { title: 'Zoning and Code Analysis', description: 'Research and document all applicable building codes, zoning laws, and regulations.', priority: 'High' },
      { title: 'Design Development', description: 'Refine the schematic design, selecting materials, finishes, and systems.', priority: 'Medium' },
      { title: 'Construction Documents', description: 'Create detailed drawings and specifications for construction.', priority: 'Medium' },
      { title: 'Bidding and Negotiation', description: 'Solicit bids from contractors and negotiate construction contracts.', priority: 'Low' },
      { title: 'Permit Application', description: 'Submit construction documents to the local building department for approval.', priority: 'High' },
      { title: 'Construction Administration', description: 'Oversee the construction process to ensure it aligns with the design and specifications.', priority: 'Medium' },
      { title: 'Client Material Selection', description: 'Assist the client in selecting final materials, fixtures, and finishes.', priority: 'Low' },
      { title: 'Punch List and Project Closeout', description: 'Identify and resolve any remaining issues before final project completion.', priority: 'Low' }
    ]
  };

  return Promise.resolve(JSON.stringify(mockTasks));
};

const generateProjectWorkflow = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const owner = req.user._id;

    if (!userPrompt) {
      return res.status(400).json({ message: 'userPrompt is required' });
    }

    // 1. Engineered system prompt for the LLM
    const systemPrompt = `
      As an expert architecture operations manager, generate a structured JSON array of 10-15 specific, professional architectural tasks for the following project: '${userPrompt}'.
      Each task must have the following properties: 'title', 'description', 'priority' (High, Medium, or Low), and 'status' (set to 'To Do').
      The output must be a JSON object with a single key "tasks" that contains the array of task objects.
    `;

    // 2. Get the structured JSON response from the LLM
    const aiResponseString = await getAIResponse(systemPrompt);
    const aiResponse = JSON.parse(aiResponseString);
    const tasksData = aiResponse.tasks;

    if (!tasksData || !Array.isArray(tasksData)) {
      return res.status(500).json({ message: 'Invalid response from AI model' });
    }

    // 3. Create a new Project
    const project = new Project({
      name: userPrompt,
      description: `Project generated from prompt: "${userPrompt}"`,
      owner,
      members: [], // Initially, no members other than the owner
    });
    await project.save();

    // 4. Bulk-insert the tasks linked to the new project
    const tasksToInsert = tasksData.map(task => ({
      ...task,
      project: project._id,
      createdBy: owner,
      status: 'To Do', // Ensure status is set correctly
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Add default due date
    }));

    const insertedTasks = await Task.insertMany(tasksToInsert);

    // 5. Link the inserted tasks to the project
    project.tasks = insertedTasks.map(task => task._id);
    await project.save();

    // 6. Return the fully populated project object
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('tasks');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error generating project workflow:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (assuming authentication middleware is used)
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const owner = req.user._id; // Assuming req.user is populated by auth middleware

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      name,
      description,
      owner,
      members: members || [],
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    // If the user is an admin, they can see all projects
    if (req.user.role === 'admin') {
      query = {}; // No filter, get all projects
    } else {
      // Otherwise, find projects where the authenticated user is either the owner or a member
      query = {
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('tasks'); // Populate owner and members details
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('tasks'); // Populate tasks here

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the authenticated user is the owner or a member of the project
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }
    debug('Project object being sent to frontend:', project);
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a project by ID
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { name, description, members, startDate, endDate } = req.body;

    debug('Received startDate:', startDate);
    debug('Received endDate:', endDate);

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.members = members !== undefined ? members : project.members; // Allow clearing members
    project.startDate = startDate !== undefined ? startDate : project.startDate;
    project.endDate = endDate !== undefined ? endDate : project.endDate;

    debug('Project object before save:', project);
    await project.save();
    debug('Project object after save:', project);
    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a project by ID
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne(); // Use deleteOne() or remove() depending on Mongoose version
    res.status(200).json({ message: 'Project removed' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  generateProjectWorkflow,
};
