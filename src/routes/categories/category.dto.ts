import Joi from 'joi';

export const categoryValidator = Joi.object({
  title: Joi.string().alphanum().min(3).max(30).required(),
  author: Joi.number().required(),
  postsIds: Joi.array().items(Joi.number()).min(1).required(),
});
