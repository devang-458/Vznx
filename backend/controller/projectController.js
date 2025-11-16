const Project = require('../models/Project');
const User = require('../models/User'); // Assuming User model is needed for owner/members

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (assuming authentication middleware is used)
exports.createProject = async (req, res) => {
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
exports.getProjects = async (req, res) => {
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
      .populate('members', 'name email'); // Populate owner and members details
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the authenticated user is the owner or a member of the project
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a project by ID
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

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

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a project by ID
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
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
