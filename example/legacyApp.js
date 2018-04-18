'use strict';

/*
 * Example application that uses cnn-hapi as a dependency to provide a basic
 * Hapi server with built in features that this example doesn't need to care
 * about.
 *
 * See the comments inline for changes that would be typical in an external app
 */
const path = require('path');
const hapi = require('../init'); // hapi = require('cnn-hapi'),
const cnnhealth = require('cnn-health');
const otherChecks = require('./config/otherchecks');

let healthChecks = cnnhealth(path.resolve(__dirname, './config/healthcheck')).asArray(),
  app,
  server;

healthChecks = healthChecks.concat(otherChecks);

server = module.exports = hapi({
  directory: __dirname,
  port: process.env.PORT,
  name: 'testHarness',
  description: 'A Test Harness for building CNN-HAPI',
  loaderIoValidationKey: process.env.LOADER_IO_VALIDATION,
  withSwagger: true,
  withGoodConsole: true,
  // metrics: {provider: require('cnn-metrics'), options: {flushEvery: 20 * 1000}},
  layoutsDir: `${__dirname}/views/`,
  healthChecks: healthChecks,
  maxAge: '10',
  surrogateCacheControl: 'max-age=60, stale-while-revalidate=10, stale-if-error=6400',
  customHeaders: [
    {
      name: 'Connection',
      value: 'close'
    }
  ]
});

app = server.hapi;

app.route({
  method: 'GET',
  path: '/',
  handler: function routeHandler(request, reply) {
    reply('Hello router');
  }
});

app.start(function() {
  console.log('App Starting');
});
