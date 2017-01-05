'use strict';

require('dotenv').config();
const Hapi = require('hapi');
const Boom = require('boom');
const mongojs = require('mongojs');
const Relish = require('relish')();
const JWT = require('jsonwebtoken');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: '0.0.0.0', 
    port: 8080,
    routes: {
        validate: {
          failAction: Relish.failAction
        }
    }
});

server.app.db = mongojs('survey', ['assessments', 'participants', 'users']);

server.register([
  require('./routes/assessments'),
  require('./routes/participants'),
  require('./routes/users')
], (err) => {
  if (err) {
    throw err;
  }
  
  const authScheme = function (server, options) {
      return {
          authenticate: function (request, reply) {
              const authorization = request.headers.authorization;
              JWT.verify(authorization, process.env.JWT_KEY, function(err, decoded) {
                  if (err) {
                      return reply(Boom.wrap(err, 401));
                  }
                  
                  return reply.continue({
                    credentials: {
                      // TODO: how does this object get used by the response?
                    }
                  });
              });
          }
      };
  };

  server.auth.scheme('jwt', authScheme);
  server.auth.strategy('default', 'jwt');
  server.auth.default('default');

  server.start((err) => {
    console.log('Server running at:', server.info.uri);
  });
});