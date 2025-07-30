'use strict';

const fp = require('fastify-plugin');
const fastifySensible = require('@fastify/sensible');

module.exports = fp(async function sensiblePlugin(fastify, _opts) {
  fastify.register(fastifySensible, {
    errorHandler: false
  });
});
