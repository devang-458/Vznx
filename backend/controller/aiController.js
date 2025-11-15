const Task = require("../models/Task.js");
const User = require("../models/User.js");

/**
 * Suggest task breakdown - Convert a complex task into subtasks using AI logic
 */
const suggestTaskBreakdown = async (req, res) => {
    try {
        const { taskTitle, taskDescription } = req.body;

        if (!taskTitle) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        // AI logic to break down task (can be integrated with OpenAI API)
        const suggestedSubtasks = generateSubtasksFromDescription(taskTitle, taskDescription);
        const estimatedDuration = estimateTaskDuration(taskTitle, suggestedSubtasks.length);
        const difficulty = calculateDifficulty(suggestedSubtasks.length);

        res.json({
            success: true,
            data: {
                suggestedSubtasks,
                estimatedDuration,
                difficulty,
                tips: getTaskTips(taskTitle)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Suggest best assignee based on workload and skills
 */
const suggestAssignee = async (req, res) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get all team members
        const users = await User.find({ role: 'member', isActive: true });

        // Calculate workload for each user
        const userMetrics = await Promise.all(users.map(async (user) => {
            const assignedTasks = await Task.countDocuments({
                'assignedTo._id': user._id,
                status: { $ne: 'Completed' }
            });

            const completedTasks = await Task.countDocuments({
                'assignedTo._id': user._id,
                status: 'Completed'
            });

            return {
                user,
                assignedCount: assignedTasks,
                completedCount: completedTasks,
                workloadPercentage: (assignedTasks * 100) / Math.max(assignedTasks + completedTasks, 1)
            };
        }));

        // Sort by lowest workload
        userMetrics.sort((a, b) => a.workloadPercentage - b.workloadPercentage);

        // Get top 3 suggestions
        const suggestions = userMetrics.slice(0, 3).map((metric, index) => ({
            userId: metric.user._id,
            name: metric.user.name,
            email: metric.user.email,
            workloadPercentage: Math.round(metric.workloadPercentage),
            reason: `Has lowest workload (${Math.round(metric.workloadPercentage)}%) and completed ${metric.completedCount} tasks`,
            confidence: (3 - index) / 3
        }));

        res.json({
            success: true,
            data: {
                suggestedAssignee: suggestions[0],
                alternatives: suggestions.slice(1),
                teamMetrics: {
                    totalMembers: users.length,
                    averageWorkload: (userMetrics.reduce((a, b) => a + b.workloadPercentage, 0) / userMetrics.length).toFixed(1)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Smart schedule - Suggest optimal deadline based on priority and workload
 */
const smartSchedule = async (req, res) => {
    try {
        const { taskPriority, estimatedHours, assignedTo } = req.body;

        if (!taskPriority || !estimatedHours) {
            return res.status(400).json({ 
                message: 'Task priority and estimated hours are required' 
            });
        }

        const now = new Date();
        let baseDaysToAdd = 1;

        // Adjust based on priority
        switch(taskPriority.toLowerCase()) {
            case 'critical':
                baseDaysToAdd = 0; // Today
                break;
            case 'high':
                baseDaysToAdd = 1; // Tomorrow
                break;
            case 'medium':
                baseDaysToAdd = 3;
                break;
            case 'low':
                baseDaysToAdd = 7;
                break;
            default:
                baseDaysToAdd = 3;
        }

        // Adjust for estimated hours
        if (estimatedHours > 8) {
            baseDaysToAdd += Math.ceil(estimatedHours / 8);
        }

        const suggestedDueDate = new Date(now.getTime() + baseDaysToAdd * 24 * 60 * 60 * 1000);
        suggestedDueDate.setHours(17, 0, 0, 0); // End of business day

        // Generate alternatives
        const alternatives = [
            {
                date: new Date(suggestedDueDate.getTime() - 2 * 24 * 60 * 60 * 1000),
                probability: 0.6,
                description: 'Aggressive deadline'
            },
            {
                date: suggestedDueDate,
                probability: 0.85,
                description: 'Recommended deadline'
            },
            {
                date: new Date(suggestedDueDate.getTime() + 2 * 24 * 60 * 60 * 1000),
                probability: 0.95,
                description: 'Flexible deadline'
            }
        ];

        res.json({
            success: true,
            data: {
                suggestedDueDate,
                reasoning: `Based on ${taskPriority} priority and ${estimatedHours} hours of work`,
                alternatives,
                workingDaysEstimate: Math.ceil(estimatedHours / 8)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Generate task description using AI hints
 */
const generateTaskDescription = async (req, res) => {
    try {
        const { taskTitle, context } = req.body;

        if (!taskTitle) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        // Generate description based on keywords
        const description = generateDescriptionFromTitle(taskTitle, context);
        const suggestedChecklist = generateChecklist(taskTitle);

        res.json({
            success: true,
            data: {
                suggestedDescription: description,
                suggestedChecklist,
                estimatedEffort: calculateEffortLevel(taskTitle)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Predict task completion date based on historical data
 */
const predictCompletion = async (req, res) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get similar completed tasks
        const similarTasks = await Task.find({
            status: 'Completed',
            priority: task.priority,
            'assignedTo._id': task.assignedTo?.[0]?._id
        }).select('dueDate completedAt createdAt');

        // Calculate average completion time
        let averageDays = 3; // Default
        if (similarTasks.length > 0) {
            const totalDays = similarTasks.reduce((sum, t) => {
                const created = new Date(t.createdAt);
                const completed = new Date(t.completedAt || t.dueDate);
                return sum + Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
            }, 0);
            averageDays = Math.ceil(totalDays / similarTasks.length);
        }

        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + averageDays);

        res.json({
            success: true,
            data: {
                predictedCompletionDate: predictedDate,
                basedOnSimilarTasks: similarTasks.length,
                averageCompletionDays: averageDays,
                confidence: Math.min(0.95, Math.max(0.5, similarTasks.length / 10))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper functions
function generateSubtasksFromDescription(title, description) {
    const subtasks = [];
    
    // Common patterns for task breakdown
    const keywords = {
        'api': ['Design endpoint', 'Implement endpoint', 'Add validation', 'Write tests', 'Document API'],
        'bug': ['Reproduce issue', 'Debug code', 'Fix issue', 'Test fix', 'Update documentation'],
        'feature': ['Design UI', 'Implement feature', 'Add tests', 'Code review', 'Deploy'],
        'database': ['Design schema', 'Create migration', 'Add indexes', 'Write tests', 'Document changes'],
        'refactor': ['Analyze code', 'Plan refactoring', 'Implement changes', 'Run tests', 'Code review']
    };

    let matchedKeywords = [];
    for (const [key, tasks] of Object.entries(keywords)) {
        if (title.toLowerCase().includes(key)) {
            matchedKeywords = tasks;
            break;
        }
    }

    return matchedKeywords.length > 0 ? matchedKeywords : [
        'Plan and research',
        'Implementation',
        'Testing',
        'Documentation',
        'Review and deployment'
    ];
}

function estimateTaskDuration(title, subtaskCount) {
    const baseHours = 2;
    const hoursPerSubtask = 3;
    const totalHours = baseHours + (subtaskCount * hoursPerSubtask);
    
    if (totalHours < 8) return '1 day';
    if (totalHours < 16) return '1-2 days';
    if (totalHours < 40) return '1 week';
    if (totalHours < 80) return '1-2 weeks';
    return '2+ weeks';
}

function calculateDifficulty(subtaskCount) {
    if (subtaskCount <= 3) return 'Easy';
    if (subtaskCount <= 5) return 'Medium';
    if (subtaskCount <= 7) return 'Hard';
    return 'Very Hard';
}

function getTaskTips(taskTitle) {
    return [
        'Break down the task into smaller, manageable subtasks',
        'Assign clear owners for each subtask',
        'Set realistic deadlines',
        'Communicate progress regularly'
    ];
}

function generateDescriptionFromTitle(title, context) {
    return `This task involves: ${title}. 
    
    Key objectives:
    - Complete the primary goal
    - Ensure quality and testing
    - Document the work
    - Request code review
    
    ${context ? `Additional context: ${context}` : ''}`;
}

function generateChecklist(title) {
    const defaultChecklist = [
        'Requirements understood',
        'Implementation started',
        'Testing completed',
        'Code reviewed',
        'Documentation updated'
    ];

    if (title.toLowerCase().includes('bug')) {
        return [
            'Bug reproduced',
            'Root cause identified',
            'Fix implemented',
            'Fix tested',
            'Regression testing done'
        ];
    }

    return defaultChecklist;
}

function calculateEffortLevel(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('fix') || lowerTitle.includes('bug')) {
        return 'Low to Medium';
    }
    if (lowerTitle.includes('feature') || lowerTitle.includes('implement')) {
        return 'Medium to High';
    }
    return 'Medium';
}

module.exports = {
    suggestTaskBreakdown,
    suggestAssignee,
    smartSchedule,
    generateTaskDescription,
    predictCompletion
};
