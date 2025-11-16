const Joi = require('joi');

const bulkUpdateStatusSchema = Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed').required()
});

const bulkUpdatePrioritySchema = Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').required()
});

const bulkAssignTasksSchema = Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    userIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
});

const bulkDeleteTasksSchema = Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
});

const bulkUpdateDueDateSchema = Joi.object({
    taskIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    dueDate: Joi.date().iso().required()
});

module.exports = {
    bulkUpdateStatusSchema,
    bulkUpdatePrioritySchema,
    bulkAssignTasksSchema,
    bulkDeleteTasksSchema,
    bulkUpdateDueDateSchema
};
