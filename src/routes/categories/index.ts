import { FastifyPluginAsync } from 'fastify';
import { knex } from '../../db/knex';
import { Body, Params } from '../../types/route';
import { categoryValidator } from './category.dto';

const categoriesRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/all', async function (request, reply) {
    const categories = await knex('categories');
    const output = [];

    for (const category of categories) {
      const posts = await knex('post_category')
        .select('posts.*')
        .join('posts', 'post_category.postId', 'posts.id')
        .where('post_category.categoryId', category.id);

      output.push({
        ...category,
        posts,
      });
    }

    return output;
  });

  fastify.get<{ Params: Params }>('/:id', async function (request, reply) {
    const category = await knex('categories').where('id', request.params.id).first();

    const post = await knex('post_category')
      .select('posts.*')
      .join('posts', 'post_category.postId', 'posts.id')
      .where('post_category.categoryId', category.id);

    return {
      ...category,
      post,
    };
  });

  fastify.patch<{ Params: Params; Body: Body }>('/:id', async function (request, reply) {
    const category = await knex('categories')
      .where('id', request.params.id)
      .update({ title: request.body.title, updated_at: new Date() });

    return category;
  });

  fastify.delete<{ Params: Params }>('/:id', async function (request, reply) {
    const category = await knex('categories').where('id', request.params.id).del();

    return category;
  });

  fastify.post<{ Body: Body }>('/', async function (request, reply) {
    try {
      const data = await categoryValidator.validateAsync(request.body);

      const { postsIds, ...insert } = data;
      const category = await knex('categories')
        .returning('id')
        .insert({ ...insert, created_at: new Date(), updated_at: new Date() });

      if (postsIds?.length) {
        for (const postId of postsIds) {
          await knex('post_category').insert({ postId, categoryId: category[0].id });
        }
      }

      return { message: 'Data received successfully', category };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
};

export default categoriesRoute;
