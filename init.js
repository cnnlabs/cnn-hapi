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
        let self = this;

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

        this.server.ext({
            type: 'onPreResponse',
            method: function (req, reply) {
                self.config.setCacheControlHeaders(req, self.config.cacheHeaders);
                self.config.setCustomHeaders(req, self.config.customHeaders);
                return reply.continue();
            }
        });

        this.server.app.__name = this.config.name = cleanName(this.config.name);
        this.server.app.__environment = this.config.env;
        this.server.app.__isProduction = this.config.env.toUpperCase() === this.config.envProd.toUpperCase();
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
        this._isDebug = (this.config.env !== options.envProd);

        // set max listeners
        this.setMaxListeners(this.config.maxListeners);
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
    get isDebug() {
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
