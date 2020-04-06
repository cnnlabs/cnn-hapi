/*
 * Example application that uses cnn-hapi as a dependency to provide a basic
 * Hapi server with built in features that this example doesn't need to care
 * about.
 *
 * See the comments inline for changes that would be typical in an external app
 */
require('isomorphic-fetch');

const {resolve} = require('path');
const Handlebars = require('handlebars');
const hapi = require('../init'); // hapi = require('cnn-hapi'),
const healthChecks = require('cnn-health')(resolve(__dirname, './config/healthcheck')).asArray();

const hapiServer = hapi({
  basePath: __dirname,

  description: 'A Test Harness for building CNN-HAPI',
  name: 'testHarness',
  surrogateCacheControl: 'max-age=66, stale-while-revalidate=10, stale-if-error=6400',

  loaderIoValidationKey: process.env.LOADER_IO_VALIDATION,
  port: process.env.PORT,

  withGoodConsole: true,
  withSwagger: true,
  host: 'localhost',

  healthChecks: [...healthChecks, ...require('./config/otherchecks')],

  customHeaders: [
    {
      name: 'Connection',
      value: 'close'
    }
  ],
  localTLS: {
    cert: '.local/localhost.cnn.io.crt',
    key: '.local/localhost.cnn.io.key',
    port: process.env.LOCAL_TLS_PORT
  },
  metrics: {
    provider: require('cnn-metrics'),
    options: {flushEvery: 6 * 1000}
  }
});

/* get the hapi server */
hapiServer
        .then((server) => {
    /* get the hapi server */
    const app = server.hapi;

    /* set the application routes */
    app.route(require('./routes'));

    app.views({
        engines: { html: Handlebars },
        relativeTo: __dirname,
        path: 'views'
    });

    return app.start().then(() => {
        console.log('info', `Server name: ${server.registry.settings.name}`);
        console.log('info', `Server version: ${server.registry.settings.version}`);
        console.log('info', `Server environment: ${server.registry.settings.environment}`);
        console.log('info', `Server in debug mode: ${server.registry.settings.isDebug}`);
        console.log('info', 'Server Metrics:', server.registry.settings.metrics);
    });
});
