'use strict';

const FastifyAutoLoad = require('@fastify/autoload');
const path = require('node:path');

/** @type {import('fastify').FastifyServerOptions} */
module.exports.options = {
  ignoreTrailingSlash: true
};

/** @type {import('fastify').FastifyPluginAsync} */
module.exports = async function (fastify, opts) {
  // Load JSON schemas
  await fastify.register(FastifyAutoLoad, {
    dir: path.join(__dirname, 'schemas')
  });

  // Load plugin/application configs
  await fastify.register(require('./configs/index.cjs'));
  fastify.log.info('Config loaded %o', fastify.config);

  // Load plugins
  fastify.register(FastifyAutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: fastify.config
  });

  // Load routes
  fastify.register(FastifyAutoLoad, {
    dir: path.join(__dirname, 'routes'),
    autoHooks: true,
    autoHooksPattern: /.*\.hooks\.cjs$/i,
    cascadeHooks: true,
    ignorePattern: /.*\.cjs$/i,
    indexPattern: /.*routes\.cjs$/i,
    options: opts
  });
};
