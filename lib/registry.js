'use strict';

let util    = require('util');



class Registry {
    constructor(config, {metrics = {}, withHandlebars, withSwagger}, {version}) {
        this.settings = Object.assign({}, config, {metrics, withHandlebars, withSwagger}, {version});
        this.withVision = withHandlebars || withSwagger;
        this._map       = {};
        this._registry  = [];
    }

    getGoodOptions() {
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

    getSwaggerOptions() {
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
                version: this.pkg.version
            }
        }});
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
        /*let hasNullMetricsProvider = this.config.metrics.provider === null;*/

        this.register('inert', {options: {}});
        this.withVision && this.register('vision', {options: {}});
        this.settings.withSwagger && this.getSwaggerOptions();
        this.settings.withGoodConsole && this.getGoodOptions();
        this.settings.metrics.provider && this.registerMetricsPlugin();
    }

    registerMetricsPlugin() {
        return this.register('./plugins/metrics', {options: {
            message: 'hello',
            metrics: this.config.metrics.provider
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
