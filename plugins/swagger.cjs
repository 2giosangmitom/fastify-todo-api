'use strict';

const fp = require('fastify-plugin');
const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUI = require('@fastify/swagger-ui');
const pkg = require('../package.json');

module.exports = fp(
  async function swaggerPlugin(fastify, _opts) {
    fastify.register(fastifySwagger, {
      exposeRoute: fastify.secrets.NODE_ENV !== 'production',
      swagger: {
        info: {
          title: 'Fastify todo app',
          description: 'Mini Fastify todo app',
          version: pkg.version
        }
      }
    });

    fastify.register(fastifySwaggerUI, {
      routePrefix: '/docs'
    });
  },
  { dependencies: ['application-config'] }
);
