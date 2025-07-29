const fp = require('fastify-plugin');

module.exports = fp(async function schemaLoader(fastify) {
  fastify.addSchema(require('./dotenv.json'));
});
