'use strict';

const fp = require('fastify-plugin');
const generateHash = require('./generate-hash.cjs');

// Register this plugin with empty prefix
module.exports.prefixOverride = '';
module.exports = fp(async function applicationAuth(fastify, _opts) {
  fastify.post(
    '/register',
    {
      schema: {
        body: fastify.getSchema('schema:auth:register')
      }
    },
    async function registerHandler(request, reply) {
      const existingUser = await this.usersDataSource.readUser(request.body.username);
      if (existingUser) {
        const err = new Error('User already registered');
        err.statusCode = 409;
        throw err;
      }

      const { hash, salt } = await generateHash(request.body.password);

      try {
        const newUserId = await this.usersDataSource.createUser({
          username: request.body.username,
          salt,
          hash
        });
        request.log.info({ userId: newUserId }, 'User registered');

        reply.code(201);

        return { registered: true };
      } catch (error) {
        request.log.error(error, 'Failed to register user');
        reply.code(500);
        return { registered: false };
      }
    }
  );

  fastify.post(
    '/authenticate',
    {
      schema: {
        body: fastify.getSchema('schema:auth:register'),
        response: {
          200: fastify.getSchema('schema:auth:token')
        }
      }
    },
    async function authenticateHandler(request, reply) {
      const user = await this.usersDataSource.readUser(request.body.username);

      if (!user) {
        const err = new Error('Wrong credentials provided');
        err.statusCode = 401;
        throw err;
      }

      const { hash } = await generateHash(request.body.password, user.salt);
      if (hash !== user.hash) {
        const err = new Error('Wrong credentials provided');
        err.statusCode = 401;
        throw err;
      }

      request.user = user;

      return refreshHandler(request, reply);
    }
  );

  fastify.get(
    '/me',
    {
      onRequest: fastify.authenticate,
      schema: {
        headers: fastify.getSchema('schema:auth:token-header'),
        response: {
          200: fastify.getSchema('schema:user')
        }
      }
    },
    async function meHandler(request, _reply) {
      return request.user;
    }
  );

  fastify.post(
    '/refresh',
    {
      onRequest: fastify.authenticate,
      schema: {
        headers: fastify.getSchema('schema:auth:token-header'),
        response: {
          200: fastify.getSchema('schema:auth:token')
        }
      }
    },
    refreshHandler
  );

  async function refreshHandler(request, _reply) {
    const token = await request.generateToken();
    return { token };
  }
});
