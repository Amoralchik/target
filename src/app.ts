import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { schema } from './db/schema';

const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const cors = require('@fastify/cors');

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  await schema();

  void fastify.register(swagger, {
    swagger: {
      info: {
        title: 'API Documentation',
        description: 'Description of API',
        version: '1.0.0',
      },
      host: 'localhost',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  fastify.register(swaggerUi, {
    routePrefix: '/docs',
    exposeRoute: false,
  });

  await fastify.register(cors); // still don't work?

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
export { app, options };
