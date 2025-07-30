'use strict';

/** @type {import("fastify").FastifyPluginAsync} */
module.exports = async function todoRoutes(fastify, _opts) {
  fastify.addHook('onRequest', fastify.authenticate);

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
      const insertedId = await request.todosDataSource.createTodo(request.body);
      reply.code(201);
      return { id: insertedId };
    }
  );

  fastify.get(
    '/',
    {
      schema: {
        querystring: fastify.getSchema('schema:todo:list:query'),
        response: {
          200: fastify.getSchema('schema:todo:list:response')
        }
      }
    },
    async function listTodo(request, _reply) {
      const { skip, limit, title } = request.query;
      const todos = await request.todosDataSource.listTodos({ filter: { title }, skip, limit });
      const totalCount = await request.todosDataSource.countTodos();
      return { data: todos, totalCount };
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: fastify.getSchema('schema:todo:read:params'),
        response: {
          200: fastify.getSchema('schema:todo')
        }
      }
    },
    async function readTodo(request, reply) {
      const todo = await request.todosDataSource.readTodo(request.params.id);
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
        body: fastify.getSchema('schema:todo:update:body'),
        params: fastify.getSchema('schema:todo:read:params')
      }
    },
    async function updateTodo(request, reply) {
      const res = await request.todosDataSource.updateTodo(request.params.id, request.body);
      if (res.modifiedCount === 0) {
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
      const res = await request.todosDataSource.deleteTodo(request.params.id);
      if (res.deletedCount === 0) {
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
      const res = await request.todosDataSource.updateTodo(request.params.id, {
        done: request.params.status === 'done'
      });
      if (res.modifiedCount === 0) {
        reply.code(404);
        return { error: 'Todo not found' };
      }

      reply.code(204);
    }
  );
};
