/*
 * Example application that uses cnn-hapi as a dependency to provide a basic
 * Hapi server with built in features that this example doesn't need to care
 * about.
 *
 * See the comments inline for changes that would be typical in an external app
 */
require('isomorphic-fetch');

const {resolve} = require('path');
const hapi = require('../init'); // hapi = require('cnn-hapi'),
const healthChecks = require('cnn-health')(resolve(__dirname, './config/healthcheck')).asArray();

const server = hapi();

/* get the hapi server */
const app = server.hapi;

/* set the application routes */
app.route(require('./routes'));

app.start(function serverStart() {
  app.connections.length &&
    app.connections.forEach((connection) => console.log('info', `Server started at: ${connection.info.uri}`));
  console.log('info', `Server name: ${server.name}`);
  console.log('info', `Server version: ${server.version}`);
  console.log('info', `Server environment: ${server.environment}`);
  console.log('info', `Server in debug mode: ${server.isDebug}`);
  console.log('info', 'Server Metrics:', server.metrics);
});
