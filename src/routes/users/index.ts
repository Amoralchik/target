import { FastifyPluginAsync } from 'fastify';
import { knex } from '../../db/knex';
import { Body, Params } from '../../types/route';
import { userValidator } from './users.dto';

const usersRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/all', async function (request, reply) {
    const users = await knex('users').select('id', 'username');

    const output = [];

    for (const user of users) {
      const posts = await knex('posts').where('posts.author', user.id);
      const categories = await knex('categories').where('categories.author', user.id);

      output.push({
        ...user,
        posts,
        categories,
      });
    }

    return output;
  });

  fastify.get<{ Params: Params }>('/:id', async function (request, reply) {
    const user = await knex('users').where('id', request.params.id).select('id', 'username').first();

    const posts = await knex('posts').where('posts.author', user.id);
    const categories = await knex('categories').where('categories.author', user.id);

    const output = {
      ...user,
      posts,
      categories,
    };

    return output;
  });

  fastify.patch<{ Params: Params; Body: Body }>('/:id', async function (request, reply) {
    const user = await knex('users')
      .where('id', request.params.id)
      .update({ username: request.body.username, updated_at: new Date() });

    return user;
  });

  fastify.delete<{ Params: Params }>('/:id', async function (request, reply) {
    const user = await knex('users').where('id', request.params.id).del();

    return user;
  });

  fastify.post<{ Body: Body }>('/', async function (request, reply) {
    try {
      const data = await userValidator.validateAsync(request.body);

      await knex('users').insert({ ...data, created_at: new Date(), updated_at: new Date() });

      reply.code(200).send({ message: 'Data received successfully', data });
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
};

export default usersRoute;
