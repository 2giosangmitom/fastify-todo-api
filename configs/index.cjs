'use strict';

const fp = require('fastify-plugin');
const FastifyEnv = require('@fastify/env');

module.exports = fp(
  async function configLoader(fastify) {
    await fastify.register(FastifyEnv, {
      confKey: 'secrets',
      schema: fastify.getSchema('schema:dotenv')
    });

    fastify.decorate('config', {
      mongo: {
        url: fastify.secrets.MONGO_URL
      }
    });
  },
  {
    name: 'application-config'
  }
);
