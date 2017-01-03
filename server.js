'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');
const Relish = require('relish')();

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

server.app.db = mongojs('hapi-rest-mongo', ['assessments', 'participants', 'users']);

server.register([  
  require('./routes/assessments'),
  require('./routes/participants'),
  require('./routes/users')
], (err) => {
  if (err) {
    throw err;
  }

  // Start the server
  server.start((err) => {
    console.log('Server running at:', server.info.uri);
  });
});