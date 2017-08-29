const Config = require('./lib/config');
const Hapi = require('hapi');
const Podium = require('podium');
const Registry = require('./lib/registry');



class Service extends Podium {
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

        (this.config.settings.localTLS && !this.config.settings.isProduction())
        ? this.server.connection([this.config.httpsConnection, this.config.httpConnection])
        : this.server.connection([this.config.httpConnection]);

        this.registry  = new Registry(this.config, this.pkg);
        this.registry.registerDefaults();

    }

    // get App
    static instance(options) {
        let  { _instance } = Service;

        if (_instance === null || _instance === undefined) {
            _instance = new Service(options);

            _instance.server.register(_instance.registry.bundle, (error) => {
                if (error) {
                    console.error(error); process.exit(1);
                }
            });
        }

        return _instance;
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
        const { environment } = this.config.settings;
        return environment;
    }

    get hapi() {
        return this.server;
    }

    get isDebug() {
        const { isProduction } = this.config.settings;
        return !isProduction();
    }

    get metrics() {
        const { metrics } = this.config.settings;

        return (
            metrics &&
            metrics.provider &&
            metrics.provider.system.counts()
        ) || null;
    }

    get name() {
        const { name } = this.config.settings;
        return name;
    }

    get port() {
        const { port } = this.config.settings;
        return port;
    }

    get version() {
        const { version } = this.pkg;
        return version;
    }

}

module.exports = function (options) {
    return Service.instance(options);
};
