'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const json2csv = require('json2csv');
const appRoot = require('app-root-path');
const assessmentDao = require(appRoot + '/private/services/assessment-dao.js');
const datasetService = require(appRoot + '/private/services/dataset-service.js');

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm:ss';

exports.register = function(server, options, next) {
    const db = server.app.db;
    const dateRegex = /\b^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\b/;

    server.route({
        method: 'GET',
        path: '/datasets',
        handler: function(request, reply) {
            if (!request.auth.credentials.isAdmin) {
                return reply(Boom.unauthorized('Only admins may access this endpoint'));
            }
            
            var params = request.query;
            var query = {};
            if (params.surveyName) {
                query.surveyName = params.surveyName;
            }
            
            assessmentDao.find(db, query).then(function(assessments) {
                return datasetService.getCsv(db, params.surveyName, assessments);
            }).then(function(csv) {
                return reply(csv);
            }).catch(function(err) {
                return reply(Boom.wrap(err, 'Error creating dataset'));
            });
        }
    });
    
    server.route({
        method: 'POST',
        path: '/datasets/templates',
        handler: function(request, reply) {
            if (!request.auth.credentials.isAdmin) {
                return reply(Boom.unauthorized('Only admins may access this endpoint'));
            }
            
            var file = request.payload.file;
            if (!file) {
                return reply(Boom.badRequest('file argument be specified'));
            }
            
            datasetService.saveTemplate(db, file.path).then(function(result) {
                return reply(result);
            }).catch(function(err) {
                return reply(Boom.wrap(err, 400));
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
            if (!request.auth.credentials.isAdmin) {
                return reply(Boom.unauthorized('Only admins may access this endpoint'));
            }
            
            var params = request.query;
            datasetService.getFields(db, params.surveyName).then(function(fields) {
                return reply(fields);
            }).catch(function(err) {
                return reply(Boom.wrap(err, 400));
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-datasets'
};
