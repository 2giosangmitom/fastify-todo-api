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

  fastify.get('/:id', async function readTodo(request, reply) {
    const todo = await todos.findOne(
      { _id: this.mongo.ObjectId.createFromHexString(request.params.id) },
      { projection: { _id: 0 } }
    );

    if (!todo) {
      reply.code(404);
      return { error: 'Todo not found' };
    }

    return todo;
  });

  fastify.put('/:id', async function updateTodo(request, reply) {
    const res = await todos.updateOne(
      {
        _id: this.mongo.ObjectId.createFromHexString(request.params.id)
      },
      {
        $set: {
          ...request.body,
          modifiedAt: new Date()
        }
      }
    );

    if (res.modifiedCount === 0) {
      reply.code(404);
      return { error: 'Todo not found' };
    }

    reply.code(204);
  });

  fastify.delete('/:id', async function deleteTodo(request, reply) {
    const res = await todos.deleteOne({
      _id: this.mongo.ObjectId.createFromHexString(request.params.id)
    });

    if (res.deletedCount === 0) {
      reply.code(404);
      return { error: 'Todo not found' };
    }

    reply.code(204);
  });

  fastify.post('/:id/:status', async function changeStatus(request, reply) {
    const done = request.params.status === 'done';
    const res = await todos.updateOne(
      {
        _id: this.mongo.ObjectId.createFromHexString(request.params.id)
      },
      {
        $set: {
          done,
          modifiedAt: new Date()
        }
      }
    );

    if (res.modifiedCount === 0) {
      reply.code(404);
      return { error: 'Todo not found' };
    }

    reply.code(204);
  });
};
