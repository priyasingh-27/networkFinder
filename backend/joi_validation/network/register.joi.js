const joi = require('joi');

module.exports = joi.object().keys({
    name: joi.string().required(),
    category: joi.string().required(),
    type:joi.string().valid('Investor', 'Mentor').required()
});