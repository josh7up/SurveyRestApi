'use strict';

const moment = require('moment');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const json2csv = require('json2csv');
const assessmentDao = require('./assessment-dao.js');
const datasetService = require('./dataset-service.js');
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm:ss';
const fs = require('fs');

exports.register = function(server, options, next) {
    const db = server.app.db;
    const dateRegex = /\b^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\b/;

    server.route({
        method: 'GET',
        path: '/datasets',
        handler: function(request, reply) {
            var params = request.query;
            var query = {};
            if (params.surveyName) {
                query.surveyName = params.surveyName;
            }
            
            assessmentDao.find(db, query, function(err, assessments) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                
                datasetService.getCsv(db, params.surveyName, assessments, function(err, csv) {
                    if (err) {
                        return reply(Boom.wrap(err, 400));
                    }
                    return reply(csv);
                });
            });
        }
    });
    
    server.route({
        method: 'POST',
        path: '/datasets',
        handler: function(request, reply) {
            var file = request.payload.file;
            fs.readFile(file.path, 'utf8', function (err, data) {
                if (err) {
                    return reply(Boom.wrap(err, 400));
                }
                
                const json = JSON.parse(data);
                json._id = uuid.v1();
                db.surveyDescriptions.save(json, (err, result) => {
                    if (err) {
                        return reply(Boom.wrap(err, 400));
                    } else {
                        return reply(json);
                    }
                });
            });
        },
        config: {
            payload: {
               output: 'file',
               maxBytes: 209715200
            }
        }
    });
    
    server.route({
        method: 'GET',
        path: '/datasets/fields',
        handler: function(request, reply) {
            var params = request.query;
            datasetService.getFields(db, params.surveyName, function(err, fields) {
                if (err) {
                    return reply(Boom.wrap(err, 400));
                }
                return reply(fields);
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-datasets'
};
