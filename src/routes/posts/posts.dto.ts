import Joi from 'joi';

export const postValidator = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  author: Joi.number().required(),
  categoriesIds: Joi.array().items(Joi.number()).min(1).required(),
  content: Joi.string().min(3).required(),
});
