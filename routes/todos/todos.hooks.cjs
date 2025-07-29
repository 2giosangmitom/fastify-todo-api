'use strict';

const fp = require('fastify-plugin');
const schemas = require('./schemas/loader.cjs');

module.exports = fp(async function todoAutoHooks(fastify, _opts) {
  fastify.register(schemas);

  const todos = fastify.mongo.db.collection('todos');

  fastify.decorate('mongoDataSource', {
    async createTodo({ title }) {
      const _id = new fastify.mongo.ObjectId();
      const now = new Date();

      const { insertedId } = await todos.insertOne({
        _id,
        title,
        done: false,
        createdAt: now,
        modifiedAt: now
      });

      return insertedId;
    },
    async listTodo({ skip, limit, title }) {
      const filter = title ? { title: new RegExp(title, 'i') } : {};
      const data = await todos.find(filter, { limit, skip }).toArray();
      const totalCount = await todos.countDocuments(filter);
      return { data, totalCount };
    },
    async readTodo({ id }) {
      const todo = await todos.findOne(
        { _id: fastify.mongo.ObjectId.createFromHexString(id) },
        { projection: { _id: 0 } }
      );

      return todo;
    },
    async updateTodo({ id, data: newData }) {
      const res = await todos.updateOne(
        {
          _id: fastify.mongo.ObjectId.createFromHexString(id)
        },
        {
          $set: {
            ...newData,
            modifiedAt: new Date()
          }
        }
      );

      return res.modifiedCount;
    },
    async deleteTodo({ id }) {
      const res = await todos.deleteOne({
        _id: fastify.mongo.ObjectId.createFromHexString(id)
      });

      return res.deletedCount;
    },
    async changeStatus({ id, status }) {
      const done = status === 'done';
      const res = await todos.updateOne(
        {
          _id: fastify.mongo.ObjectId.createFromHexString(id)
        },
        {
          $set: {
            done,
            modifiedAt: new Date()
          }
        }
      );

      return res.modifiedCount;
    }
  });
});
