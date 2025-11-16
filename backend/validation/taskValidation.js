const Joi = require('joi');

const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(0).max(1000).allow('', null),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    dueDate: Joi.date().iso().allow(null),
    assignedTo: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    attachments: Joi.array().items(Joi.string().uri()).optional(),
    todoChecklist: Joi.array().items(Joi.object({
        text: Joi.string().required(),
        completed: Joi.boolean().default(false)
    })).optional(),
    comment: Joi.string().min(1).optional() // For initial comment when creating task
});

const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().min(0).max(1000).allow('', null).optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    dueDate: Joi.date().iso().allow(null).optional(),
    assignedTo: Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
    attachments: Joi.array().items(Joi.string().uri()).optional(),
    todoChecklist: Joi.array().items(Joi.object({
        text: Joi.string().required(),
        completed: Joi.boolean().default(false)
    })).optional()
});

const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'In Progress', 'Completed').required()
});

const updateTaskChecklistSchema = Joi.object({
    todoChecklist: Joi.array().items(Joi.object({
        text: Joi.string().required(),
        completed: Joi.boolean().default(false)
    })).min(0).required()
});

module.exports = {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    updateTaskChecklistSchema
};
