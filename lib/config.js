const Fs = require('fs');
const Joi = require('joi');

const { resolve } = require('path');

class Config {

    constructor({description, name, version}, options, basePath) {

        const internals = {
            defaults: {
                basePath: basePath,
                cacheControlHeader: process.env.CACHE_CONTROL || 'max-age=60',
                customHeaders: options.customHeaders || [],
                description: options.description || description,
                environment: process.env.ENVIRONMENT || process.env.NODE_ENV || options.environment || '',
                healthChecks: options.healthChecks || [],
                host: process.env.HOST || options.host || '0.0.0.0',
                loaderIoValidationKey: options.loaderIoValidationKey || undefined,
                localTLS: options.localTLS || null,
                maxListeners: process.env.DEFAULT_MAX_LISTENERS || options.maxListeners || 10,
                name: options.name || name,
                port: process.env.PORT || options.port || 3000,
                surrogateCacheControl: process.env.SURROGATE_CACHE_CONTROL || options.surrogateCacheControl || 'max-age=360, stale-while-revalidate=60, stale-if-error=86400',
                version: version,
                withGoodConsole: options.withGoodConsole || false,
                withSwagger: options.withSwagger || false
            }
        };

        internals.schema = {
            basePath: Joi.string()
                .description('directory of the current process')
                .example('/Users/mjr'),
            cacheControlHeader: Joi.string()
                .description('maximum cache lifetime in seconds')
                .example('max-age=60'),
            customHeaders: Joi.array(),
            description: Joi.string()
                .description('a description of the application')
                .example('CNN Hapi'),
            environment: Joi.string()
                .description('application environment')
                .example('dev'),
            healthChecks: Joi.array(),
            host: Joi.string()
                .description('application host')
                .example('0.0.0.0'),
            loaderIoValidationKey: Joi.string()
                .description('loader.io validation'),
            layoutsDir: Joi.string()
                .description('the application view')
                .example('`${__dirname}/views/`'),
            localTLS: Joi.object().keys({
                cert: Joi.string(),
                key: Joi.string(),
                port: Joi.number().integer()
            }),
            maxListeners: Joi.number().integer()
                .description('max listeners per event')
                .example(1000),
            metrics: Joi.object().keys({
                provider: Joi.object(),
                options: Joi.object()
            }),
            name: Joi.string()
                .description('application name')
                .example('cnn-hapi'),
            port: Joi.number().integer()
                .description('http port')
                .example(3000),
            surrogateCacheControl: Joi.string()
                .description('external cache layer')
                .example('max-age=360, stale-while-revalidate=60, stale-if-error=86400'),
            version: Joi.string()
                .description('version of the application')
                .example('0.0.1'),
            withGoodConsole: Joi.boolean(),
            withSwagger: Joi.boolean()
        };

        this.settings = Object.assign(internals.defaults, options, {description, name, version});
        Joi.assert(this.settings, internals.schema, 'Invalid service configuration');

        this.settings.isProduction = () => {
            const {
                environment
            } = this.settings;

            return environment.toLowerCase() === 'production' ||
            environment.toLowerCase() === 'prod';
        };
    }

    get httpConnection() {
        const {
            host,
            labels,
            port
        } = this.settings;

        return {
            host,
            labels: labels || 'http',
            port
        };
    }

    get httpsConnection() {
        const {
            cert,
            key,
            port = 3000
        } = this.settings.localTLS;

        const {
            basePath,
            host,
            labels
        } = this.settings;

        return {
            host,
            labels: Array.isArray(labels) ? [...labels, 'local-tls'] : 'local-tls',
            port,
            routes: { security: { hsts: true }},
            tls: {
                key: Fs.readFileSync(resolve(basePath, `./${key}`)),
                cert: Fs.readFileSync(resolve(basePath, `./${cert}`))
            }
        };
    }
}

module.exports = Config;
