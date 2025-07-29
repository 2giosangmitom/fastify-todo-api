const fp = require('fastify-plugin');

module.exports = fp(async function todoSchemaLoader(fastify, _opts) {
  fastify.addSchema(require('./create-body.json'));
  fastify.addSchema(require('./status-params.json'));
  fastify.addSchema(require('./list-query.json'));
  fastify.addSchema(require('./create-schema.json'));
  fastify.addSchema(require('./read-params.json'));
  fastify.addSchema(require('./update-body.json'));
});
