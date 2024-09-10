const Joi = require("joi");

const payJobSchema = Joi.object({
  job_id: Joi.number().integer().required(),
});

module.exports = { payJobSchema };
