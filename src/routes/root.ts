import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            anything: { type: 'string' },
          },
        },
      },
    },
    handler: (req, res) => {
      res.send({ anything: 'meaningfull' });
    },
  });
};

export default root;
