'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

var jwtSign = function(username, callback) {
    JWT.sign({
        username: username
    }, process.env.JWT_KEY, { algorithm: 'HS256', issuer: 'survey' }, function(err, token) {
        if (err) {
            callback(err, null);
        } else {
            var jwtResponse = {
                username: username,
                token: token
            };
            callback(null, jwtResponse);
        }
    });
};

exports.register = function(server, options, next) {
    const db = server.app.db;
    
    db.users.ensureIndex('username', {unique: true}, function(err, name) {
        console.log('in ensureIndex, name = ' + name);
    }); 

    server.route({
        method: 'GET',
        path: '/users',
        handler: function(request, reply) {
            db.users.find((err, docs) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Error retrieving users'));
                }
                reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/users',
        handler: function(request, reply) {
            const user = request.payload;
            user._id = uuid.v1();
            
            var saltRounds = 10;
            bcrypt.hash(user.password, saltRounds, function(err, hash) {
                if (err) {
                    console.log("Error hashing the password");
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                
                var dbUser = {
                    username: user.username,
                    hashedPassword: hash
                };
                
                db.users.save(dbUser, (err, result) => {
                    if (!result) {
                        return reply(Boom.badRequest('Error creating user'));
                    }
                    if (err) {
                        console.log('db save error: ', err);
                        return reply(Boom.wrap(err, 400));
                    }
                    
                    jwtSign(user.username, function(err, result) {
                        if (err) {
                            return reply(Boom.wrap(err, 400));
                        }
                        return reply(result);
                    });
                });
            });
        },
        config: {
            auth: false,
            validate: {
                payload: {
                    username: Joi.string().min(4).max(100).required(),
                    password: Joi.string().min(8).max(200).required()
                }
            }
        }
    });
    
    server.route({
        method: 'POST',
        path: '/users/authenticate',
        handler: function(request, reply) {
            const user = request.payload;
            
            db.users.findOne({ username: user.username }, (err, result) => {
                if (!result) {
                    return reply(Boom.badRequest('Authentication failed'));
                }
                if (err) {
                    return reply(Boom.wrap(err, 400));
                }
                
                bcrypt.compare(user.password, result.hashedPassword, function(err, result) {
                    if (!result) {
                        return reply(Boom.badRequest('Authentication failed'));
                    }
                    if (err) {
                        return reply(Boom.wrap(err, 400));
                    }
                    
                    jwtSign(user.username, function(err, result) {
                        if (err) {
                            return reply(Boom.wrap(err, 400));
                        }
                        return reply(result);
                    });
                });
            });
        },
        config: {
            auth: false,
            validate: {
                payload: {
                    username: Joi.string().min(4).max(100).required(),
                    password: Joi.string().min(8).max(200).required()
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
