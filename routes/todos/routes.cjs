'use strict';

/** @type {import("fastify").FastifyPluginAsync} */
module.exports = async function todoRoutes(fastify, _opts) {
  fastify.post(
    '/',
    {
      schema: {
        body: fastify.getSchema('schema:todo:create:body'),
        response: {
          201: fastify.getSchema('schema:todo:create:response')
        }
      }
    },
    async function createTodo(request, reply) {
      const insertedId = await this.mongoDataSource.createTodo(request.body);
      reply.code(201);
      return { id: insertedId };
    }
  );

  fastify.get(
    '/',
    {
      schema: {
        params: fastify.getSchema('schema:todo:list:query')
      }
    },
    async function listTodo(request, _reply) {
      return this.mongoDataSource.listTodo(request.query);
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: fastify.getSchema('schema:todo:read:params')
      }
    },
    async function readTodo(request, reply) {
      const todo = await this.mongoDataSource.readTodo(request.params);

      if (!todo) {
        reply.code(404);
        return { error: 'Todo not found' };
      }

      return todo;
    }
  );

  fastify.put(
    '/:id',
    {
      schema: {
        body: fastify.getSchema('schema:todo:update:body')
      }
    },
    async function updateTodo(request, reply) {
      const modifiedCount = await this.mongoDataSource.updateTodo({
        id: request.params.id,
        data: request.body
      });

      if (modifiedCount === 0) {
        reply.code(404);
        return { error: 'Todo not found' };
      }

      reply.code(204);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: fastify.getSchema('schema:todo:read:params')
      }
    },
    async function deleteTodo(request, reply) {
      const deletedCount = await this.mongoDataSource.deleteTodo(request.params);

      if (deletedCount === 0) {
        reply.code(404);
        return { error: 'Todo not found' };
      }

      reply.code(204);
    }
  );

  fastify.post(
    '/:id/:status',
    {
      schema: {
        params: fastify.getSchema('schema:todo:status:params')
      }
    },
    async function changeStatus(request, reply) {
      const modifiedCount = await this.mongoDataSource.changeStatus(request.params);

      if (modifiedCount === 0) {
        reply.code(404);
        return { error: 'Todo not found' };
      }

      reply.code(204);
    }
  );
};
