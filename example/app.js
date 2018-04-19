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

const server = hapi({
  basePath: __dirname,

  description: 'A Test Harness for building CNN-HAPI',
  name: 'testHarness',
  surrogateCacheControl: 'max-age=60, stale-while-revalidate=10, stale-if-error=6400',

  loaderIoValidationKey: process.env.LOADER_IO_VALIDATION,
  port: process.env.PORT,

  withGoodConsole: true,
  withSwagger: true,
  host: 'localhost',

  healthChecks: [...healthChecks, require('./config/otherchecks')],

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

const overrideCnnHapiDefaults = (request, reply) => {
  if (!request.someArbitraryKeyThatYouSet) {
    request.someArbitraryKeyThatYouSet = [];
  }
  // add override headers if they exist
  const overrides = request.someArbitraryKeyThatYouSet;
  try {
    if (Array.isArray(overrides)) {
      for (let i = 0; i < overrides.length; i++) {
        request.response.header(overrides[i].name, overrides[i].value);
      }
    }
  } catch (err) {
    debug(err);
  }
  return reply.continue();
};

/* get the hapi server */
const app = server.hapi;

/* set the application routes */
app.route(require('./routes'));

app.ext('onPreResponse', overrideCnnHapiDefaults);

app.start(function serverStart() {
  app.connections.length &&
    app.connections.forEach((connection) => console.log('info', `Server started at: ${connection.info.uri}`));
  console.log('info', `Server name: ${server.name}`);
  console.log('info', `Server version: ${server.version}`);
  console.log('info', `Server environment: ${server.environment}`);
  console.log('info', `Server in debug mode: ${server.isDebug}`);
  console.log('info', 'Server Metrics:', server.metrics);
});
