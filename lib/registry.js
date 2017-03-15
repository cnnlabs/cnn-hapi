'use strict';

const util    = require('util');



class Registry {
    constructor(config, {version}) {
        this.settings = Object.assign({}, {
            basePath: config.settings.basePath,
            cacheControlHeader: config.settings.cacheControlHeader,
            customHeaders: config.settings.customHeaders,
            description: config.settings.description,
            environment: config.settings.environment,
            healthChecks: config.settings.healthChecks,
            name: config.settings.name,
            metrics: config.settings.metrics || {},
            setCacheControlHeaders: config.setCacheControlHeaders,
            setCustomHeaders: config.setCustomHeaders,
            surrogateCacheControl: config.settings.surrogateCacheControl,
            withSwagger: config.settings.withSwagger},
            {version}
        );

        this._map = {};
        this._registry = [];
    }

    // set the registry map
    register(key, options) {

        if (key in this._map) {
            console.log(util.format('Object with key %s already exists in the Registry', key));
            return;
        }
        this._map[key] = options;
    }

    registerApplicationMeta() {
        return this.register('./plugins/application-meta', {options: {
            basePath: this.settings.basePath,
            description: this.settings.description,
            environment: this.settings.environment,
            healthChecks: this.settings.healthChecks,
            name: this.settings.name,
            version: this.settings.version
        }});
    }

    registerDefaults() {
        this.register('inert', {options: {}});
        this.registerApplicationMeta();
        this.registerOnPreResponse();
        this.settings.withSwagger && this.registerSwaggerDocs();
        this.settings.withGoodConsole && this.registerProcessMonitor();
        this.settings.metrics.provider && this.registerMetricsPlugin();
    }

    registerMetricsPlugin() {
        return this.register('./plugins/metrics', {options: {
            flushEvery: process.env.METRICS_FLUSHEVERY || this.settings.metrics.options.flushEvery || 1000 * 20,
            message: 'hello',
            metrics: this.settings.metrics,
            name: this.settings.name
        }});
    }

    registerOnPreResponse() {
        return this.register('./plugins/onPreResponse', {options: {
            cacheControlHeader: this.settings.cacheControlHeader,
            customHeaders: this.settings.customHeaders,
            surrogateCacheControl: this.settings.surrogateCacheControl,
            setCacheControlHeaders: this.settings.setCacheControlHeaders,
            setCustomHeaders: this.settings.setCustomHeaders
        }});
    }

    registerProcessMonitor() {
        return this.register('good', {options: {
            ops: {interval: 5000}, reporters: {
                console: [{module: 'good-squeeze', name: 'Squeeze',
                    args: [{log: '*', ops: '*', response: '*'}]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }});
    }

    registerSwaggerDocs() {
        this.register('vision', {options: {}});
        return this.register('hapi-swagger', {options: {
            info: {
                description: this.settings.description,
                contact: {
                    email: this.settings.contactEmail,
                    name: this.settings.contactName,
                    url: this.settings.contactUrl
                },
                license: {
                    name: this.settings.licenseName,
                    url: this.settings.licenseUrl
                },
                termsOfService: this.settings.termsOfService,
                title: this.settings.name,
                version: this.settings.version
            }
        }});
    }

    // require each plugin
    get bundle() {
        var obj,
            plugin;

        for (let b in this._map) {
            obj  = Object.create(null);
            plugin = Object.defineProperties(obj, {
                register: {value: require(b), enumerable: true, writable: true},
                options: {value: this._map[b].options, enumerable: true}
            });

            this._registry.push(plugin);
        }

        return this._registry;
    }
}

module.exports = Registry;
