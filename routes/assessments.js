'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const assessmentDao = require('./assessment-dao.js');

exports.register = function(server, options, next) {
    const db = server.app.db;

    var responseSchema = Joi.object().keys({
        responseId: Joi.string().required(),
        responseDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/).required(),
        values: Joi.array().items()
    });

    server.route({
        method: 'GET',
        path: '/assessments',
        handler: function(request, reply) {
            var params = request.query;
            var query = {};
            // Only include assessments for the currently authenticated user.
            query['participant.id'] = request.auth.credentials.username;
            if (params.surveyName) {
                query.surveyName = params.surveyName;
            }
            
            assessmentDao.find(db, query, function(err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }, function(docs) {
                reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/assessments',
        handler: function(request, reply) {
            const assessment = request.payload;
            if (!request.auth.credentials.username || request.auth.credentials.username !== assessment.participant.id) {
                return reply(Boom.forbidden('Assessment data must be posted by the same user that created the data.'));
            }

            assessment._id = uuid.v1();
            assessmentDao.save(db, assessment, function(err) {
                return reply(Boom.wrap(err, 'Error saving assessment'));
            }, function(result) {
                reply(result);
            });
        },
        config: {
            validate: {
                options: {
                    allowUnknown: true
                },
                payload: {
                    surveyName: Joi.string().min(4).max(50).required(),
                    startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/).required(),
                    endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/).required(),
                    timeoutDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/),
                    participant: Joi.object({
                        id: Joi.string().required()
                    }).required(),
                    responses: Joi.array().items(responseSchema)
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-assessments'
};
