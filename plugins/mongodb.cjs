'use strict';

const fp = require('fastify-plugin');
const FastifyMongo = require('@fastify/mongodb');

module.exports = fp(async function mongoDB(fastify, opts) {
  fastify.register(FastifyMongo, opts.mongo);
});
