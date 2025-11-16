const Joi = require('joi');

const addCommentSchema = Joi.object({
    content: Joi.string().min(1).required(),
    mentions: Joi.array().items(Joi.string().hex().length(24)).optional()
});

const updateCommentSchema = Joi.object({
    content: Joi.string().min(1).optional(),
    mentions: Joi.array().items(Joi.string().hex().length(24)).optional()
});

const addReactionSchema = Joi.object({
    emoji: Joi.string().min(1).required()
});

const replyToCommentSchema = Joi.object({
    content: Joi.string().min(1).required(),
    mentions: Joi.array().items(Joi.string().hex().length(24)).optional()
});

module.exports = {
    addCommentSchema,
    updateCommentSchema,
    addReactionSchema,
    replyToCommentSchema
};
