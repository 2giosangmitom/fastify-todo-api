'use strict';

/** @type {import("fastify").FastifyPluginAsync} */
module.exports = async function todoRoutes(fastify, _opts) {
  const todos = fastify.mongo.db.collection('todos');

  fastify.post('/', async function createTodo(request, reply) {
    const _id = new this.mongo.ObjectId();
    const now = new Date();
    const createdAt = now;
    const modifiedAt = now;

    const newTodo = {
      _id,
      ...request.body,
      done: false,
      createdAt,
      modifiedAt
    };

    await todos.insertOne(newTodo);
    reply.code(201);

    return { id: _id };
  });

  fastify.get('/', async function listTodo(request, _reply) {
    const { skip, limit, title } = request.query;
    const filter = title ? { title: new RegExp(title, 'i') } : {};
    const data = await todos.find(filter, { limit, skip }).toArray();

    const totalCount = await todos.countDocuments(filter);

    return { data, totalCount };
  });
};
