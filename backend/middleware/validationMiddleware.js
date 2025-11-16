const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false, // Include all errors
        allowUnknown: true // Allow unknown properties (e.g., if other middleware adds properties)
    });

    if (error) {
        const errors = error.details.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};

module.exports = validate;
