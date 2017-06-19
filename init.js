const events = require('events'),
    Config = require('./lib/config'),
    Hapi = require('hapi'),
    Registry = require('./lib/registry');



class Service extends events.EventEmitter {
    constructor(options = {}) {
        super();

        // set the application base path
        this.basePath = options.basePath || process.cwd();

        // get application name and version
        this.pkg = require(`${this.basePath}/package`);

        // set the server defaults
        this.config = new Config(this.pkg, options, this.basePath);

        if (!this.config.settings.name) {
            throw new Error('Please specify an application name');
        }

        // spin up a new Hapi server
        this.server = new Hapi.Server();
        this.server.decorate('server', 'emitter', this.emit);
        this.server.decorate('server', 'onemit', this.on);
        this.server.connection(this.config.connectionOptions);

        this.registry  = new Registry(this.config, this.pkg);
        this.registry.registerDefaults();

        this._isDebug = this.config.settings.environment === 'production' ||
            this.config.settings.environment === 'prod';
        this.config.settings.maxListeners && this.setMaxListeners(this.config.settings.maxListeners);
    }

    // get App
    static instance(options) {
        if (Service._instance === null || Service._instance === undefined) {
            Service._instance = new Service(options);

            Service._instance.server.register(Service._instance.registry.bundle, (error) => {
                if (error) {
                    console.error(error); process.exit(1);
                }
            });
        }

        return Service._instance;
    }

    logEvent(msg) {
        this.server.emitter('log', msg);
    }

    set routes(routes) {
        this.server.route(routes);
    }

    get cfg() {
        return this.config;
    }

    get cwd() {
        return this.basePath;
    }

    get environment() {
        return this.config.settings.environment;
    }

    get hapi() {
        return this.server;
    }

    get isDebug() {
        return !this._isDebug;
    }

    get maxListeners() {
        return this.getMaxListeners();
    }

    get metrics() {
        return (this.config.settings.metrics &&
            this.config.settings.metrics.provider &&
            this.config.settings.metrics.provider.system.counts()) || null;
    }

    get name() {
        return this.config.settings.name;
    }

    get port() {
        return this.config.settings.port;
    }

    get version() {
        return this.pkg.version;
    }

}

module.exports = function (options) {
    return Service.instance(options);
};
