'use strict';

const hapi = require('hapi'),
    robots = require('./lib/hapi/robots'),
    _ = require('lodash'),
    cleanName = require('./lib/clean-name');

require('isomorphic-fetch');

let setupHealthCheck = function (request, reply) {
        let payload,
            response,
            returnCode = 200,
            checks = request.server.app.__healthchecks.map((check) => {
                return check.getStatus();
            });

        if (checks.length === 0) {
            checks.push({
                name: 'App has no healthchecks',
                ok: false,
                severity: 3,
                businessImpact: 'If this application encounters any problems, nobody will be alerted and it probably will not get fixed.',
                technicalSummary: 'This app has no healthchecks set up',
                panicGuide: 'Yes. Panic',
                lastUpdated: new Date()
            });
        }

        if (request.params.checknumber) {
            checks.forEach(function (check) {
                if (check.severity <= Number(request.params.checknumber) && check.ok === false) {
                    returnCode = 500;
                }
            });
        }

        payload = JSON.stringify({
            schemaVersion: 1,
            name: `CNN-${request.server.app.__name}`,
            description: request.server.app.__description,
            checks: checks
        }, null, 2);

        response = reply(payload).code(returnCode);
        response.header('Cache-Control', 'private, no-cache, max-age=0');
        response.header('Content-Type', 'application/json');

    },
    metricsProvider = {};

/**
 * Validate that response header exists
 * @private
 * @param {object} request
 */
function hasHeaders(request) {
    let value = false;

    if (typeof request.response === 'object' &&
        request.response !== null &&
        typeof request.response.header === 'function') {
        value = true;
    }

    return value;
}

/**
 * Set up cache control headers
 * @private
 * @param {object} request - Request object
 * @param {object} headers - The cache control headers to set
 */
function setCacheControlHeaders(request, headers) {
    let surrogateControl = headers.surrogateCacheControl ? headers.surrogateCacheControl : false,
        cacheControl = headers.cacheControlHeader ? headers.cacheControlHeader : false;

    if (hasHeaders(request) === true) {
        if (typeof surrogateControl === 'string') {
            request.response.header('Surrogate-Control', surrogateControl);
        }

        if (typeof cacheControl === 'string') {
            request.response.header('Cache-Control', cacheControl);
        }
    }
}

/**
 * Set up custom headers
 * @private
 * @param {object} request - Request object
 * @param {object} customHeaders - The custome headers to set
 */
function setCustomHeaders(request, customHeaders) {
    let header,
        length,
        i = 0;

    if (hasHeaders(request) === true) {
        length = customHeaders.length;
        for (; i < length; i++) {
            header = customHeaders[i];
            if (header.name && header.value) {
                request.response.header(header.name, header.value);
            }
        }
    }
}

module.exports = function (options) {
    options = options || {};
    let packageJson = {},
        metricOptions = {flushEvery: 6 * 1000},
        defaults = {
            port: 3000,
            withFlags: true,
            withSwagger: false,
            withHandlebars: true,
            metrics: {provider: require('cnn-metrics'), options: metricOptions},
            withBackendAuthentication: true,
            healthChecks: []
        },
        port = process.env.PORT || options.port,
        environment  = process.env.NODE_ENV || process.env.ENVIRONMENT || '',
        server = new hapi.Server(),
        name = options.name,
        description = '',
        directory = options.directory || process.cwd(),
        actualAppStart,
        cacheControlHeader = process.env.CACHE_CONTROL || options.maxAge || 'max-age=60', // Default cache time is 60 seconds
        surrogateControlHeader = process.env.SURROGATE_CACHE_CONTROL || options.surrogateCacheControl ||
            'max-age=360, stale-while-revalidate=60, stale-if-error=86400',
        cacheHeaders = {
            cacheControlHeader: cacheControlHeader,
            surrogateCacheControl: surrogateControlHeader
        },
        connectionOptions = {
            port: port
        },
        customHeaders = (options.customHeaders) ? options.customHeaders : [];

    if (options.routes) {
        connectionOptions.routes = options.routes;
    }

    options = _.merge(defaults, options);
    server.connection(connectionOptions);

    if (!name) {
        try {
            packageJson = require(`${directory}/package.json`);
            name = packageJson.name;
            description = packageJson.description;
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
    server.app.__description = options.description || description;
    server.app.__healthchecks = options.healthChecks;

    try {
        server.app.__version = require(`${directory}/public/__about.json`).appVersion;
    } catch (e) {
        // Its OK
    }

    if (options.metrics) {
        options.metrics.provider.init({app: name, flushEvery: options.metrics.options.flushEvery});
        metricsProvider = options.metrics.provider;
    }

    /* jscs:disable */
    server.register(require('inert'), () => {});
    /* jscs:enable*/


    if (options.withSwagger) {
        /* jscs:disable */
        server.register(require('vision'), () => {});
        /* jscs:enable */

        let swaggerOptionsInfo = {};

        swaggerOptionsInfo.title = options.name || undefined;
        swaggerOptionsInfo.description = options.description || undefined;
        swaggerOptionsInfo.termsOfService = options.termsOfService || undefined;
        swaggerOptionsInfo.version = options.version || undefined;

        if (options.contactName || options.contactEmail || options.contactUrl) {
            swaggerOptionsInfo.contact = {};
            swaggerOptionsInfo.contact.name = options.contactName || undefined;
            swaggerOptionsInfo.contact.email = options.contactEmail || undefined;
            swaggerOptionsInfo.contact.url = options.contactUrl || undefined;
        }

        if (options.licenseName || options.licenseUrl) {
            swaggerOptionsInfo.license = {};
            swaggerOptionsInfo.license.name = options.licenseName || undefined;
            swaggerOptionsInfo.license.url = options.licenseUrl || undefined;
        }

        server.register({
            register: require('hapi-swagger'),
            options: {
                info: swaggerOptionsInfo
            }
        });
    }

    if (options.metrics.provider) {
        server.register({
            register: require('./lib/plugins/metrics'),
            options: {
                message: 'hello',
                metrics: options.metrics.provider
            }
        });
    }

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

    server.ext({
        type: 'onPreResponse',
        method: function (request, reply) {
            setCacheControlHeaders(request, cacheHeaders);
            setCustomHeaders(request, customHeaders);
            return reply.continue();
        }
    });

    actualAppStart = server.start;

    server.start = function () {
        console.log(`Listening on  ${port}`);
        actualAppStart.apply(this, arguments);
    };


    return server;
};


module.exports.services = metricsProvider.services;
module.exports.metrics = metricsProvider;
