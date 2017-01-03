'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const assessmentDao = require('./assessment-dao.js');
const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
var privateKeyFile = path.join(__dirname, '../private.key');
const secret = fs.readFileSync(privateKeyFile);

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
            if (params.surveyName) {
                query.surveyName = params.surveyName;
            }
            
            console.log(params.surveyName);
            
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
            const token = request.headers['x-access-token'];
            JWT.verify(token, secret, function(err, decoded) {
                if (err) {
                    console.log('Error verifying jwt token:', err);
                    return reply(Boom.wrap(err, 400));
                }
                
                const assessment = request.payload;
                assessment._id = uuid.v1();
                
                assessmentDao.save(db, assessment, function(err) {
                    return reply(Boom.wrap(err, 'Error saving assessment'));
                }, function(result) {
                    reply(result);
                });
            });
        },
        config: {
            validate: {
                options: {
                    allowUnknown: true
                },
                headers: {
                    'x-access-token': Joi.string().required()
                },
                payload: {
                    surveyName: Joi.string().min(4).max(50).required(),
                    startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/).required(),
                    endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/).required(),
                    timeoutDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/),
                    participant: Joi.object({
                        id: Joi.string().required()
                    }),
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
