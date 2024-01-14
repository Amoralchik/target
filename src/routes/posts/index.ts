// @ts-nocheck
// https://github.com/fastify/fastify/issues/4873#issuecomment-1837542152

import { FastifyPluginAsync } from 'fastify';
import { knex } from '../../db/knex';
import { Body, Params, Query } from '../../types/route';
import { postValidator } from './posts.dto';

const postsRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: Query }>(
    '/all',
    {
      schema: {
        description: 'Get a list of posts',
        tags: ['Posts'],
        querystring: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            author: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            count: { type: 'integer' },
            page: { type: 'integer' },
          },
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                author: { type: 'integer' },
                title: { type: 'string' },
                content: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      author: { type: 'integer' },
                      title: { type: 'string' },
                      created_at: { type: 'string', format: 'date-time' },
                      updated_at: { type: 'string', format: 'date-time' },
                      postId: { type: 'integer' },
                      categoryId: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async function (request, reply) {
      // const posts = await knex('posts');
      let query = knex('posts');
      let output: any[] = [];

      const { category, author, startDate, endDate, count, page } = request.query;

      if (author) {
        query = query.where('author', '=', author);
      }

      if (startDate) {
        query = query.where('created_at', '>=', startDate);
      }

      if (endDate) {
        query = query.where('created_at', '<=', endDate);
      }

      query = query.orderBy('created_at', 'desc');

      const perPage = Number(count) || 10;
      const currentPage = Number(page) || 1;
      const offset = (currentPage - 1) * perPage;

      query = query.limit(perPage).offset(offset);

      query = await query.select('*');

      for (const post of query) {
        let categories = knex('post_category')
          .select('categories.*')
          .join('categories', 'post_category.categoryId', 'categories.id')
          .where('post_category.postId', post.id);

        if (category) {
          categories = categories.where('title', '=', category);
        }

        categories = await categories.select('*');

        if (category && categories.length === 0) continue;

        output.push({
          ...post,
          categories,
        });
      }

      return output;
    }
  );

  fastify.get<{ Params: Params }>('/:id', async function (request, reply) {
    const post = await knex('posts').where('id', request.params.id).first();

    const categories = await knex('post_category')
      .select('categories.*')
      .join('categories', 'post_category.categoryId', 'categories.id')
      .where('post_category.postId', post.id);

    return {
      ...post,
      categories,
    };
  });

  fastify.patch<{ Params: Params; Body: Body }>('/:id', async function (request, reply) {
    const post = await knex('posts')
      .where('id', request.params.id)
      .update({ title: request.body.title, content: request.body.content, updated_at: new Date() });

    return post;
  });

  fastify.delete<{ Params: Params }>('/:id', async function (request, reply) {
    const post = await knex('posts').where('id', request.params.id).del();

    return post;
  });

  fastify.post<{ Body: Body }>(
    '/',
    {
      schema: {
        description: 'Get a list of posts',
        tags: ['Posts'],
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'number' },
            categoriesIds: { type: 'array', items: { type: 'number' } },
          },
        },
        response: {
          201: {
            description: 'Successful response',
            type: 'object',
          },
        },
      },
    },
    async function (request, reply) {
      try {
        const data = await postValidator.validateAsync(request.body);

        const { categoriesIds, ...insert } = data;
        const post = await knex('posts')
          .returning('id')
          .insert({ ...insert, created_at: new Date(), updated_at: new Date() });

        if (categoriesIds?.length) {
          for (const categoryId of categoriesIds) {
            await knex('post_category').insert({ postId: post[0].id, categoryId });
          }
        }

        return { message: 'Data received successfully', data };
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    }
  );
};

export default postsRoute;
