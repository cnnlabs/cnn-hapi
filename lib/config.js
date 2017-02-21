'use strict';


const hasHeaders  = require('./helpers').hasHeaders;
const Joi = require('joi');


const internals = {
    defaults: {
        cacheControlHeader: process.env.CACHE_CONTROL,
        environment: process.env.ENVIRONMENT || process.env.NODE_ENV,
        host: process.env.HOST,
        maxListeners: process.env.DEFAULT_MAX_LISTENERS || 10,
        port: process.env.PORT,
        surrogateControlHeader: process.env.SURROGATE_CACHE_CONTROL,
        tls: process.env.TLS || false
    }
};

internals.schema = {
    cacheControlHeader: Joi.string().required()
        .description('maximum cache lifetime in seconds'),
    description: Joi.string().required()
        .description('a description of the application'),
    environment: Joi.string().required()
        .description('application environment'),
    host: Joi.string().required()
        .description('application host'),
    maxListeners: Joi.number().integer()
        .description('max listeners per event'),
    name: Joi.string().required()
        .description('application name'),
    port: Joi.number().integer().required()
        .description('application port'),
    surrogateControlHeader: Joi.string()
        .description('external cache layer'),
    tls: Joi.boolean()
        .description('tls flag'),
    version: Joi.string().required()
        .description('version of the application')
};



class Config {

    constructor({description, name, version}, options) {

        this.settings = Object.assign(internals.defaults, options, {description, name, version});
        Joi.assert(this.settings, internals.schema, 'Invalid service configuration');
    }

    get cacheHeaders() {
        let cacheHeaders = Object.create(null);

        cacheHeaders.cacheControlHeader     = this.settings.cacheControlHeader;
        cacheHeaders.surrogateCacheControl  = this.settings.surrogateControlHeader;

        return cacheHeaders;
    }

    get connectionOptions() {
        let connectionOptions = Object.create(null);

        connectionOptions.host      = this.settings.host;
        connectionOptions.labels    = this.settings.env;
        connectionOptions.port      = this.settings.port;
        connectionOptions.tls       = (this.settings.tls) ? this.settings.secureListener : null;
        connectionOptions.routes    = (this.settings.routes) ? this.settings.routes : {};
        connectionOptions.routes.cors   = {origin: ['*']};
        connectionOptions.routes.state  = {};

        return connectionOptions;
    }

    /**
     * Set up cache control headers
     * @param {object} request - Request object
     * @param {object} headers - The cache control headers to set
     */
    setCacheControlHeaders(request, headers) {
        let surrogateControl = headers.surrogateCacheControl ? headers.surrogateCacheControl : false,
            cacheControl = headers.cacheControlHeader ? headers.cacheControlHeader : false;

        return hasHeaders(request) &&
            request.response.header('Cache-Control', cacheControl);
    }

    /**
     * Set up custom headers
     * @param {object} request - Request object
     * @param {object} customHeaders - The custome headers to set
     */
    setCustomHeaders(request, customHeaders) {
        let header,
            length = customHeaders.length,
            i = 0;

        if (hasHeaders && length) {
            for (; i < length; i++) {
                header = customHeaders[i];
                if (header.name && header.value) {
                    request.response.header(header.name, header.value);
                }
            }
        }
    }
}

module.exports = Config;
