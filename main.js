'use strict';

const hapi = require('hapi'),
    Hoek = require('hoek'),
    robots = require('./lib/hapi/robots'),
    cleanName = require('./lib/clean-name'),
    metrics = require('cnn-metrics'),
    packageConfig = require('./package.json');

require('isomorphic-fetch');

let setupHealthCheck = function (request, reply) {
    let payload,
        response,
        checks = request.server.app.__healthchecks.map(function (check) {
            return check.getStatus();
        });

    if (checks.length === 0) {
        checks.push({
            name: 'App has no healthchecks',
            ok: false,
            severity: 3,
            businessImpact: 'If this application encounters any problems, nobody will be alerted and it probably will not get fixed.',
            technicalSummary: 'This app has no healthchecks set up',
            panicGuide: 'Don\'t Panic',
            lastUpdated: new Date()
        });
    }

    if (request.params[0]) {
        checks.forEach(function (check) {
            if (check.severity <= Number(request.params.checknumber) && check.ok === false) {
                reply.code(500);
            }
        });
    }

    //response.send();
    payload = JSON.stringify({
        schemaVersion: 1,
        name: `CNN-${request.app.__name}`,
        description: request.app.__description,
        checks: checks
    }, undefined, 2);

    response = reply(payload);
    response.header('Cache-Control', 'private, no-cache, max-age=0');
    response.header('Content-Type', 'application/json');
};


module.exports = function (options) {
    let packageJson = {},
        metricOptions = {flushEvery: 6 * 1000},
        defaults = {
            port: 3000,
            withFlags: true,
            withSwagger: false,
            withHandlebars: true,
            metrics: {provider: metrics, options: metricOptions},
            withBackendAuthentication: true,
            healthChecks: []
        },
        port = process.env.PORT || options.port,
        environment  = process.env.NODE_ENV || '',
        server = new hapi.Server(),
        name = options.name,
        description = '',
        version ='',
        directory = options.directory || process.cwd(),
        actualAppStart;

    options = options || {};
    options = Hoek.applyToDefaults(defaults, options);

    server.connection({port: port});

    if (!name) {
        try {
            packageJson = require(`${directory}/package.json`);
            name = packageJson.name;
            description = packageJson.description;
            version = packageJson.version;
        } catch (e) {
            // No problem
        }
    }

    if (!name) {
        throw new Error('Please specify an application name');
    }

    server.app.__name = name = cleanName(name);
    server.app.__environment = environment;
    server.app.__isProduction = environment.toUpperCase() === 'PRODUCTION';
    server.app.__rootDirectory = directory;
    server.app.__description = description;
    server.app.__healthchecks = options.healthChecks;

    try {
        server.app.__version = require(`${directory}/public/__about.json`).appVersion;
    } catch (e) {
        //Its OK
    }

    if (options.metrics) {
        options.metrics.provider.init({app: name, flushEvery: options.metrics.options.flushEvery});
    }

    server.register(require('inert'), () => {});


    if (options.withSwagger) {
        server.register(require('vision'), () => {});
        server.register({
            register: require('hapi-swagger'),
            options: {
                info: {
                    title: options.name,
                    description: options.description
                }
            }
        });
    }

    server.register({
        register: require('./lib/plugins/metrics'),
        options: {
            message: 'hello',
            metrics: options.metrics
        }
    });

    server.route({
        method: 'GET',
        path: '/robots.txt',
        handler: robots
    });

    server.route({
        method: 'GET',
        path: '/__whatami',
        handler: function (request, reply) {
            reply().code(418);
        }
    });

    server.route({
        method: 'GET',
        path: '/_imgood',
        handler: (request, reply) => reply(200)
    });

    server.route({
        method: 'GET',
        path: '/__health/{checknumber?}',
        handler: setupHealthCheck
    });

    actualAppStart = server.start;

    server.start = function () {
        console.log(`Listening on  ${port}`);
        actualAppStart.apply(this, arguments);
    };

    return server;
};


module.exports.services = metrics.services;
module.exports.metrics = metrics;
