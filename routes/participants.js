'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function(server, options, next) {
    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/participants',
        handler: function(request, reply) {
            db.participants.find((err, docs) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/participants',
        handler: function(request, reply) {
            const participant = request.payload;

            //Create an id
            participant._id = uuid.v1();

            db.participants.save(participant, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                reply(participant);
            });
        },
        config: {
            validate: {
                payload: {
                    participantId: Joi.string().min(1).max(50).required()
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-participants'
};
