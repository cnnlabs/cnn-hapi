const cleanName = require('../../helpers/clean-name');
const Joi = require('joi');



const internals = {schema: {
    basePath: Joi.string().required(),
    description: Joi.string().required(),
    environment: Joi.string().required(),
    healthChecks: Joi.array().sparse(),
    name: Joi.string().required(),
    version: Joi.string().required()
}};

exports.register = (server, options, next) => {
    Joi.assert(options, internals.schema, 'Invalid service configuration');

    server.app.__name = options.name = cleanName(options.name);
    server.app.__environment = options.environment;
    server.app.__isProduction = options.environment.toUpperCase();
    server.app.__rootDirectory = options.basePath;
    server.app.__description = options.description;
    server.app.__healthchecks = (options.healthChecks) ? options.healthChecks : [];

    try {
        server.app.__version = require(`${options.basePath}/public/__about.json`).appVersion;
    } catch (e) {
        server.app.__version = options.version;
    }

    next();
};

exports.register.attributes = {
    name: 'cnn-hapi-app-meta'
};
