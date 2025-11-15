const Task = require("../models/Task.js");
const User = require("../models/User.js");

/**
 * Get intelligent task insights for a user
 * Analyzes patterns and provides actionable recommendations
 */
const getTaskInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        // Get user's tasks or all tasks for admin
        const filter = isAdmin ? {} : { assignedTo: userId };
        const tasks = await Task.find(filter).populate('assignedTo', 'name email');

        // Calculate key metrics
        const now = new Date();
        const overdueCount = tasks.filter(t => 
            t.status !== 'Completed' && new Date(t.dueDate) < now
        ).length;

        const dueSoon = tasks.filter(t => {
            const daysUntilDue = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24));
            return t.status !== 'Completed' && daysUntilDue >= 0 && daysUntilDue <= 3;
        });

        // Calculate completion rate
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const completionRate = tasks.length > 0 
            ? Math.round((completedTasks / tasks.length) * 100) 
            : 0;

        // Calculate average completion time for completed tasks
        const completedWithTimes = tasks.filter(t => 
            t.status === 'Completed' && t.createdAt && t.updatedAt
        );
        
        const avgCompletionDays = completedWithTimes.length > 0
            ? Math.round(
                completedWithTimes.reduce((sum, t) => {
                    const days = (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0) / completedWithTimes.length
            )
            : 0;

        // Find high priority incomplete tasks
        const urgentTasks = tasks
            .filter(t => t.priority === 'High' && t.status !== 'Completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        // Calculate priority distribution
        const priorityBreakdown = {
            High: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
            Medium: tasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length,
            Low: tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length
        };

        // Generate smart recommendations
        const recommendations = [];

        if (overdueCount > 0) {
            recommendations.push({
                type: 'warning',
                priority: 'high',
                title: 'Overdue Tasks Detected',
                message: `You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''}. Consider reviewing priorities.`,
                action: 'View Overdue Tasks',
                actionLink: '/tasks?filter=overdue'
            });
        }

        if (dueSoon.length > 0) {
            recommendations.push({
                type: 'info',
                priority: 'medium',
                title: 'Upcoming Deadlines',
                message: `${dueSoon.length} task${dueSoon.length > 1 ? 's are' : ' is'} due within 3 days.`,
                action: 'Review Tasks',
                actionLink: '/tasks?filter=due-soon'
            });
        }

        if (priorityBreakdown.High > 5) {
            recommendations.push({
                type: 'suggestion',
                priority: 'medium',
                title: 'Too Many High Priority Tasks',
                message: `You have ${priorityBreakdown.High} high-priority tasks. Consider re-evaluating priorities.`,
                action: 'Manage Priorities',
                actionLink: '/tasks?priority=High'
            });
        }

        if (completionRate < 50 && tasks.length > 5) {
            recommendations.push({
                type: 'tip',
                priority: 'low',
                title: 'Boost Your Productivity',
                message: `Current completion rate is ${completionRate}%. Try breaking large tasks into smaller subtasks.`,
                action: 'Learn Tips',
                actionLink: '/help/productivity'
            });
        }

        // Workload analysis
        const workloadScore = calculateWorkloadScore(tasks, isAdmin);

        res.json({
            metrics: {
                totalTasks: tasks.length,
                completedTasks,
                completionRate,
                overdueCount,
                dueSoonCount: dueSoon.length,
                avgCompletionDays,
                workloadScore
            },
            priorityBreakdown,
            urgentTasks: urgentTasks.map(t => ({
                _id: t._id,
                title: t.title,
                priority: t.priority,
                dueDate: t.dueDate,
                daysUntilDue: Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24))
            })),
            recommendations,
            dueSoon: dueSoon.map(t => ({
                _id: t._id,
                title: t.title,
                dueDate: t.dueDate
            }))
        });

    } catch (error) {
        console.error('Error fetching task insights:', error);
        res.status(500).json({ 
            message: 'Server error fetching insights', 
            error: error.message 
        });
    }
};

/**
 * Calculate workload score (0-100)
 * Higher score = heavier workload
 */
const calculateWorkloadScore = (tasks, isAdmin) => {
    if (tasks.length === 0) return 0;

    const incompleteTasks = tasks.filter(t => t.status !== 'Completed');
    const now = new Date();
    
    let score = 0;
    
    // Factor 1: Number of incomplete tasks (0-40 points)
    score += Math.min((incompleteTasks.length / 20) * 40, 40);
    
    // Factor 2: Overdue tasks (0-30 points)
    const overdueCount = incompleteTasks.filter(t => 
        new Date(t.dueDate) < now
    ).length;
    score += Math.min((overdueCount / 5) * 30, 30);
    
    // Factor 3: High priority tasks (0-30 points)
    const highPriorityCount = incompleteTasks.filter(t => 
        t.priority === 'High'
    ).length;
    score += Math.min((highPriorityCount / 10) * 30, 30);
    
    return Math.round(Math.min(score, 100));
};

/**
 * Get team productivity metrics (Admin only)
 */
const getTeamAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const users = await User.find({ role: { $ne: 'admin' } }).select('name email');
        const tasks = await Task.find().populate('assignedTo', 'name email');

        const teamMetrics = await Promise.all(
            users.map(async (user) => {
                const userTasks = tasks.filter(t => 
                    t.assignedTo.some(u => u._id.toString() === user._id.toString())
                );

                const completed = userTasks.filter(t => t.status === 'Completed').length;
                const pending = userTasks.filter(t => t.status === 'Pending').length;
                const inProgress = userTasks.filter(t => t.status === 'In Progress').length;

                const completionRate = userTasks.length > 0
                    ? Math.round((completed / userTasks.length) * 100)
                    : 0;

                const now = new Date();
                const overdue = userTasks.filter(t => 
                    t.status !== 'Completed' && new Date(t.dueDate) < now
                ).length;

                return {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    totalTasks: userTasks.length,
                    completed,
                    pending,
                    inProgress,
                    overdue,
                    completionRate,
                    workloadScore: calculateWorkloadScore(userTasks, false)
                };
            })
        );

        // Sort by workload score (highest first)
        teamMetrics.sort((a, b) => b.workloadScore - a.workloadScore);

        // Calculate team averages
        const avgCompletionRate = teamMetrics.length > 0
            ? Math.round(
                teamMetrics.reduce((sum, m) => sum + m.completionRate, 0) / teamMetrics.length
            )
            : 0;

        const totalOverdue = teamMetrics.reduce((sum, m) => sum + m.overdue, 0);

        res.json({
            teamMetrics,
            summary: {
                totalMembers: users.length,
                avgCompletionRate,
                totalOverdue,
                totalActiveTasks: tasks.filter(t => t.status !== 'Completed').length
            }
        });

    } catch (error) {
        console.error('Error fetching team analytics:', error);
        res.status(500).json({ 
            message: 'Server error fetching team analytics', 
            error: error.message 
        });
    }
};

/**
 * Get suggested task prioritization based on deadlines and workload
 */
const getSuggestedPriorities = async (req, res) => {
    try {
        const userId = req.user._id;
        const tasks = await Task.find({
            assignedTo: userId,
            status: { $ne: 'Completed' }
        }).sort({ dueDate: 1 });

        const now = new Date();

        const suggestions = tasks.map(task => {
            const daysUntilDue = Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24));
            let suggestedPriority = task.priority;
            let reason = 'Current priority is appropriate';

            // Suggest priority adjustments
            if (daysUntilDue < 0) {
                suggestedPriority = 'High';
                reason = 'Task is overdue';
            } else if (daysUntilDue <= 2 && task.priority !== 'High') {
                suggestedPriority = 'High';
                reason = 'Due in 2 days or less';
            } else if (daysUntilDue <= 7 && task.priority === 'Low') {
                suggestedPriority = 'Medium';
                reason = 'Due within a week';
            }

            const todoProgress = task.todoChecklist.length > 0
                ? Math.round((task.todoChecklist.filter(t => t.completed).length / task.todoChecklist.length) * 100)
                : 0;

            return {
                taskId: task._id,
                title: task.title,
                currentPriority: task.priority,
                suggestedPriority,
                dueDate: task.dueDate,
                daysUntilDue,
                todoProgress,
                reason,
                shouldAdjust: suggestedPriority !== task.priority
            };
        });

        const needsAdjustment = suggestions.filter(s => s.shouldAdjust);

        res.json({
            suggestions,
            summary: {
                totalTasks: suggestions.length,
                needsAdjustment: needsAdjustment.length
            }
        });

    } catch (error) {
        console.error('Error generating priority suggestions:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    getTaskInsights,
    getTeamAnalytics,
    getSuggestedPriorities
};