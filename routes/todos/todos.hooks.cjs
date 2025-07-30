'use strict';

const fp = require('fastify-plugin');
const schemas = require('./schemas/loader.cjs');

module.exports = fp(async function todoAutoHooks(fastify, _opts) {
  fastify.register(schemas);

  const todos = fastify.mongo.db.collection('todos');

  fastify.decorateRequest('todosDataSource', null); // Trigger speed-optimization
  fastify.addHook('onRequest', async (request, _reply) => {
    request.todosDataSource = {
      async countTodos(filter = {}) {
        filter.userId = request.user.id;
        const totalCount = await todos.countDocuments(filter);
        return totalCount;
      },
      async listTodos({
        filter = {},
        projection = {},
        skip = 0,
        limit = 50,
        asStream = false
      } = {}) {
        if (filter.title) {
          filter.title = new RegExp(filter.title, 'i');
        } else {
          delete filter.title;
        }
        filter.userId = request.user.id;

        const cursor = todos.find(filter, {
          projection: { ...projection, _id: 0 },
          limit,
          skip
        });

        if (asStream) {
          return cursor.stream();
        }

        return cursor.toArray();
      },
      async createTodo({ title }) {
        const _id = new fastify.mongo.ObjectId();
        const now = new Date();
        const userId = request.user.id;
        const { insertedId } = await todos.insertOne({
          _id,
          userId,
          title,
          done: false,
          id: _id,
          createdAt: now,
          modifiedAt: now
        });
        return insertedId;
      },
      async createTodos(todoList) {
        const now = new Date();
        const userId = request.user.id;
        const toInsert = todoList.map((rawTodo) => {
          const _id = new fastify.mongo.ObjectId();

          return {
            _id,
            userId,
            ...rawTodo,
            id: _id,
            createdAt: now,
            modifiedAt: now
          };
        });
        await todos.insertMany(toInsert);
        return toInsert.map((todo) => ({
          id: todo._id
        }));
      },
      async readTodo(id, projection = {}) {
        const todo = await todos.findOne(
          { _id: fastify.mongo.ObjectId.createFromHexString(id), userId: request.user.id },
          { projection: { ...projection, _id: 0 } }
        );
        return todo;
      },
      async updateTodo(id, newTodo) {
        return todos.updateOne(
          { _id: fastify.mongo.ObjectId.createFromHexString(id), userId: request.user.id },
          {
            $set: {
              ...newTodo,
              modifiedAt: new Date()
            }
          }
        );
      },
      async deleteTodo(id) {
        return todos.deleteOne({
          _id: fastify.mongo.ObjectId.createFromHexString(id),
          userId: request.user.id
        });
      }
    };
  });
});
