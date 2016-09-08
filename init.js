'use strict';

let cleanName   = require('./lib/helpers/clean-name'),
    Config      = require('./lib/config'),
    events      = require('events'),
    Hapi        = require('hapi'),
    Registry    = require('./lib/registry');

require('isomorphic-fetch');

class Service extends events.EventEmitter {

    constructor(options) {
        // We must call super() in the child class to have access to the parent 'this' in a constructor
        super();

        options = options || {};

        // set the application base path
        this.basePath  = options.basePath || process.cwd();

        // get application name and version
        this.pkg       = require(`${this.basePath}/package`);
        this.pkg       = {description: this.pkg.description, name: this.pkg.name, version: this.pkg.version};

       // set the server defaults
        this.config    = new Config(this.pkg, options, this.basePath);

        if (!this.config.name) {
            throw new Error('Please specify an application name');
        }

        // spin up a new Hapi server
        this.server    = new Hapi.Server();
        this.server.decorate('server', 'emitter', this.emit);
        this.server.decorate('server', 'onemit', this.on);
        this.server.connection(this.config.connectionOptions);

        this.server.app.__name = this.config.name = cleanName(this.config.name);
        this.server.app.__environment = this.config.env;
        this.server.app.__isProduction = this.config.env.toUpperCase() === 'PRODUCTION';
        this.server.app.__rootDirectory = this.basePath;
        this.server.app.__description = this.config.description;
        this.server.app.__healthchecks = (options.healthChecks) ? options.healthChecks : [];

        try {
            this.server.app.__version = require(`${this.basePath}/public/__about.json`).appVersion;
        } catch (e) {
            this.server.app.__version = this.pkg.version;
        }

        this.registry  = new Registry(this.config, this.pkg);
        this.registry.registerDefaults();
/*
        // check to see if we're in production
        this._isDebug = (this._env !== options.env.prod);
        // set max listeners
        this.setMaxListeners(options.events.maxListeners || 10);
    */
    }

    // get App
    static instance(options) {
        if (Service._instance === null || Service._instance === undefined) {
            Service._instance = new Service(options);
        }

        return Service._instance;
    }

    set routes(routes) {
        this.server.route(routes);
    }

    logEvent(msg) {
        this.server.emitter('log', msg);
    }


    /**
     * Set up cache control headers
     * @private
     * @param {object} request - Request object
     * @param {object} headers - The cache control headers to set
     */
    setCacheControlHeaders(request, headers) {
        let surrogateControl = headers.surrogateCacheControl ? headers.surrogateCacheControl : false,
            cacheControl = headers.cacheControlHeader ? headers.cacheControlHeader : false;

        if (typeof request.response === 'object' &&
            request.response !== null &&
            typeof request.response.header === 'function') {
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
    setCustomHeaders(request, customHeaders) {
        let hasHeaders = require('./lib/utilities').hasHeaders,
            header,
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


    get cwd() {
        return this.basePath;
    }

    get hapi() {
        return this.server;
    }

    get env() {
        return this.config.env;
    }

    get port() {
        return this.config.port;
    }

    get cfg() {
        return this.config;
    }

    get pkgRegistry() {
        return this.registry.bundle;
    }

    // check debug flag
    get isDebug () {
        return this.isDebug;
    }

    get name() {
        return this.config.name;
    }

    get version() {
        return this.pkg.version;
    }

}

exports = module.exports = Service;
