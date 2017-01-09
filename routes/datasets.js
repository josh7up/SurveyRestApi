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
            
            assessmentDao.find(db, query, function(err, assessment) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                
                try {
                    const fixedFields = ['participantId', 'surveyName', 'startDate', 'startTime', 'endDate', 'endTime', 'timeoutDate', 'timeoutTime'];
                    datasetService.getFields(db, params.surveyName, function(err, dynamicFields) {
                        if (err) {
                            return reply(Boom.wrap(err, 400));
                        }
                        
                        var allFields = fixedFields.concat(dynamicFields);
                        var dataset = assessment.map(function(item) {
                            var row = {};
                            row.participantId = item.participant ? item.participant.id : '';
                            row.surveyName = item.surveyName;
                            row.startDate = item.startDate ? moment(item.startDate).format(dateFormat) : '';
                            row.startTime = item.startDate ? moment(item.startDate).format(timeFormat) : '';
                            row.endDate = item.endDate ? moment(item.endDate).format(dateFormat) : '';
                            row.endTime = item.endDate ? moment(item.endDate).format(timeFormat) : '';
                            row.timeoutDate = item.timeoutDate ? moment(item.timeoutDate).format(dateFormat) : '';
                            row.timeoutTime = item.timeoutTime ? moment(item.timeoutDate).format(timeFormat) : '';
                            
                            // Collect assessment data for each dynamic field.
                            if (item.responses) {
                                item.responses.forEach(function(response) {
                                    row[response.responseId] = response.values.map(function(value) {
                                        var convertedValue = parseInt(value);
                                        return convertedValue == NaN ? value : convertedValue;
                                    }).join(',');
                                    
                                    // Add a date and a time row mapping for each response.
                                    if (response.responseDate) {
                                        row[response.responseId + '_date'] = moment(response.responseDate).format(dateFormat);
                                        row[response.responseId + '_time'] = moment(response.responseDate).format(timeFormat);
                                    }
                                });
                            }
                            
                            return row;
                        });
                        
                        var result = json2csv({ data: dataset, fields: allFields });
                        reply(result);
                    });
                } catch (err) {
                    // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
                    // Be sure to provide fields if it is possible that your data array will be empty. 
                    console.error(err);
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
