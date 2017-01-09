'use strict';

const moment = require('moment');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const json2csv = require('json2csv');
const assessmentDao = require('./assessment-dao.js');
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
            
            assessmentDao.find(db, query, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                
                try {
                    var fields = ['participantId', 'surveyName', 'startDate', 'startTime', 'endDate', 'endTime', 'timeoutDate', 'timeoutTime'];
                    var dataset = result.map(function(item) {
                        var row = {};
                        row.participantId = item.participant ? item.participant.id : ''
                        row.surveyName = item.surveyName;
                        row.startDate = item.startDate ? moment(item.startDate).format(dateFormat) : '';
                        row.startTime = item.startDate ? moment(item.startDate).format(timeFormat) : '';
                        row.endDate = item.endDate ? moment(item.endDate).format(dateFormat) : '';
                        row.endTime = item.endDate ? moment(item.endDate).format(timeFormat) : '';
                        row.timeoutDate = item.timeoutDate ? moment(item.timeoutDate).format(dateFormat) : '';
                        row.timeoutTime = item.timeoutTime ? moment(item.timeoutDate).format(timeFormat) : '';
                        return row;
                    });
                    var result = json2csv({ data: dataset, fields: fields });
                    console.log(result);
                    reply(result);
                } catch (err) {
                    // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
                    // Be sure to provide fields if it is possible that your data array will be empty. 
                    console.error(err);
                }
            });
        }
    });
    
    server.route({
        method: 'GET',
        path: '/datasets/fields',
        handler: function(request, reply) {
            var params = request.query;
            
            var aggregate = [
                // Convert surveys array to child documents.
                {
                    $unwind: "$surveys"
                },
                // Only include the unwound survey document that matches the surveyName.
                {
                    $match: {
                        'surveys.name': params.surveyName
                    }
                },
                // Filter out unwanted fields.
                {
                    $project: {
                        'surveys.name': 1,
                        'surveys.screens.id': 1,
                    }
                }
            ];
            
            db.surveyDescriptions.aggregate(aggregate, (err, docs) => {
                if (err) {
                    return reply(Boom.wrap(err, 400));
                } else {
                    var mapped = docs[0].surveys.screens.map(function(item) {
                        return item.id;
                    });
                    return reply(mapped);
                }
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

    return next();
};

exports.register.attributes = {
    name: 'routes-datasets'
};
