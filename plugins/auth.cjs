'use strict';

const fp = require('fastify-plugin');
const fastifyJwt = require('@fastify/jwt');

module.exports = fp(
  async function authenticationPlugin(fastify, _opts) {
    const revokedTokens = new Map();

    fastify.register(fastifyJwt, {
      secret: fastify.secrets.JWT_SECRET,
      trusted: function isTrusted(_request, decodedToken) {
        return !revokedTokens.has(decodedToken.jti);
      }
    });

    fastify.decorate('authenticate', async function authenticate(request, reply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    });

    fastify.post(
      '/logout',
      {
        onRequest: fastify.authenticate
      },
      async function logoutHandler(request, reply) {
        request.revokeToken();
        reply.code(204);
      }
    );

    fastify.decorateRequest('revokeToken', function () {
      revokedTokens.set(this.user.jti, true);
    });

    fastify.decorateRequest('generateToken', function () {
      const token = fastify.jwt.sign(
        {
          id: String(this.user._id),
          username: this.user.username
        },
        {
          jti: String(Date.now()),
          expiresIn: fastify.secrets.JWT_EXPIRE_IN
        }
      );

      return token;
    });
  },
  {
    name: 'authentication-plugin',
    dependencies: ['application-config']
  }
);
