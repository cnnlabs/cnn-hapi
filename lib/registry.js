'use strict';

let util    = require('util');



class Registry {
    constructor(config, pkg) {
        this.config     = config;
        this._map       = {};
        this.pkg        = pkg;
        this._registry  = [];
    }

    // set the registry map
    register(key, options) {

        if (key in this._map) {
            console.log(util.format('Object with key %s already exists in the Registry', key));
            return;
        }
        this._map[key] = options;
    }

    registerDefaults() {
        let hasNullMetricsProvider = this.config.metrics.provider === null,
            hasLoaderIoValue = this.config.loaderIoValidationKey !== null;
        this.register('inert', {options: {}});

        if (this.config.withSwagger || this.config.withHandlebars) {
            this.register('vision', {options: {}});
        }

        if (!hasNullMetricsProvider) {
            this.register('./plugins/metrics', {options: {
                message: 'hello',
                metrics: this.config.metrics.provider
            }});
        }

        if (this.config.withSwagger) {
            this.register('hapi-swagger', {options: {
                info: {
                    description: this.config.description,
                    contact: {
                        email: this.config.contactEmail,
                        name: this.config.contactName,
                        url: this.config.contactUrl
                    },
                    license: {
                        name: this.config.licenseName,
                        url: this.config.licenseUrl
                    },
                    termsOfService: this.config.termsOfService,
                    title: this.config.name,
                    version: this.pkg.version
                }
            }});
        }

        if (hasLoaderIoValue) {
            this.register('./plugins/loader-io', {options: {
                loaderIoValidationKey: this.config.loaderIoValidationKey
            }});
        }

        if (this.config.withGoodConsole) {
            this.register('good', {options: {
                ops: {interval: 5000}, reporters: {
                    console: [{module: 'good-squeeze', name: 'Squeeze',
                        args: [{log: '*', ops: '*', response: '*'}]
                    }, {
                        module: 'good-console'
                    }, 'stdout']
                }
            }});
        }
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
