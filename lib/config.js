'use strict';


let _       = require('lodash'),
    path    = require('path');

class Config {

    constructor(pkg, options, basePath) {

        this.options = options;
        this.basePath = basePath;
        this.cacheControlHeader = this.options.maxAge || process.env.CACHE_CONTROL || 'max-age=60';
        this.description = this.options.description || pkg.description;
        this.env = this.options.host || process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
        this.port = this.options.port || process.env.PORT || 3000;
        this.host = this.options.host || process.env.HOST || '0.0.0.0';
        this.name = this.options.name || pkg.name;
        this.surrogateControlHeader = this.options.surrogateCacheControl || process.env.SURROGATE_CACHE_CONTROL ||
            'max-age=360, stale-while-revalidate=60, stale-if-error=86400';
        this.contactEmail = this.options.contactEmail || undefined;
        this.contactName = this.options.contactName || undefined;
        this.contactUrl = this.options.contactUrl || undefined;
        this.licenseName = this.options.licenseName || undefined;
        this.licenseUrl = this.options.licenseUrl || undefined;
        this.termsOfService = this.options.termsOfService || undefined;

        this.metricOptions = Object.create(null);
        this.metricOptions.app = this.name;
        this.metricOptions.flushEvery = (6 * 1000);

        this.metrics = Object.create(null);
        this.metrics.provider = require('cnn-metrics');
        this.metrics.options = this.metricOptions;

        this.withBackendAuthentication = this.options.withBackendAuthentication || true;
        this.withFlags = this.options.withFlags || true;
        this.withSwagger = this.options.withSwagger || false;
        this.withHandlebars = this.options.withHandlebars || true;
        this.withGoodConsole = this.options.withGoodConsole || false;

        this.directory = this.options.directory || process.cwd();

        this.healthChecks = [];
    }

    get cacheHeaders() {
        let cacheHeaders = Object.create(null);

        cacheHeaders.cacheControlHeader     = this.cacheControlHeader;
        cacheHeaders.surrogateCacheControl  = this.surrogateControlHeader;

        return cacheHeaders;
    }

    get connectionOptions() {
        let connectionOptions = Object.create(null);

        connectionOptions.host      = this.host;
        connectionOptions.labels    = this.env;
        connectionOptions.port      = this.port;
        connectionOptions.tls       = (this.options.tls) ? this.options.tls : false;
        connectionOptions.routes    = (this.options.routes) ? this.options.routes : {};
        connectionOptions.routes.files  = {relativeTo: path.join(this.basePath, this.options.layoutsDir)};
        connectionOptions.routes.cors   = {};
        connectionOptions.routes.state  = {};

        if (_.get(this.options, 'connections.routes.files', false)) {
            connectionOptions.routes.files = this.options.connections.routes.files;
        }

        if (_.get(this.options, 'connections.routes.cors', false)) {
            connectionOptions.routes.cors = this.options.connections.routes.cors;
        }

        if (_.get(this.options, 'connections.routes.state', false)) {
            connectionOptions.routes.state = this.options.connections.routes.state;
        }

        return connectionOptions;
    }

    get metricsProvider() {
        this.metrics.provider.init(this.metricOptions);
    }
}

module.exports = Config;
