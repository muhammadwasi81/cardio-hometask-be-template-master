const Joi = require("joi");

const getContractValidator = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "any.required": "Contract id is required",
    "number.base": "Contract id must be a number",
    "number.integer": "Contract id must be an integer",
    "number.positive": "Contract id must be a positive number",
  }),
});

module.exports = { getContractValidator };
