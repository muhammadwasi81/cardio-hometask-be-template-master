const Joi = require("joi");

const dateRangeSchema = Joi.object({
  start: Joi.date().iso().required(),
  end: Joi.date().iso().min(Joi.ref("start")).required(),
  limit: Joi.number().optional(),
});

module.exports = { dateRangeSchema };
