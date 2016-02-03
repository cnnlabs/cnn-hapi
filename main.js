"use strict";
require('isomorphic-fetch');
let hapi = require('hapi'),
    robots = require('./lib/hapi/robots'),
    cleanName = require('./lib/clean-name'),
    Good = require('good'),
    debug = require('debug')('cnn-hapi'),
    metrics = require('cnn-metrics'),
    boom = require('boom'),
    Hoek = require('hoek'),
    packageConfig = require('./package.json');


module.exports =function(options){
    options = options || {};
    let packageJson = {};
    let defaults = {
        port:3000,
        withFlags: true,
        withSwagger: false,
        withHandlebars: true,
        withBackendAuthentication: true,
        healthChecks: []
    };
    
    let port = process.env.PORT || options.port;
    options = Hoek.applyToDefaults(defaults, options);

    let environment  = process.env.NODE_ENV || '';
    let server = new hapi.Server();
    
    server.connection({port: port});
    let name = options.name;
    let description = '';
    let directory = options.directory || process.cwd();

    if (!name) {
        try {
            packageJson = require(directory + '/package.json');
            name = packageJson.name;
            description = packageJson.description || '';
        } catch(e) {
            // No problem
        }
    }
    if (!name) throw new Error('Please specify an application name');


    // Set some variables to carry around
    
    server.app.__name=name=cleanName(name);
    server.app.__environment = environment;
    server.app.__isProduction = environment.toUpperCase() === 'PRODUCTION';
    server.app.__rootDirectory = directory;
    server.app.__description = description;
    server.app.__healthchecks = options.healthChecks;

    try {
        server.app.__version = require(directory + '/public/__about.json').appVersion;
    } catch (e) {
        //Its OK
    }

    server.register(require('inert'), () => {});
    metrics.init({ app: name, flushEvery: 6000 });
    
    
    if (options.withSwagger){
        server.register(require('vision'), () => {});
        server.register({
            register: require('hapi-swagger'),
            options:{
                info: {
                    version: packageConfig.version,
                    title: packageConfig.name,
                    description: packageConfig.description
                }
            }
        });
    } 
    server.register({
        register: require('./lib/plugins/metrics'),
        options:{
            message:'hello',
            metrics: metrics
        }
    });
   
    server.route({method: 'GET', path:'/robots.txt', handler:robots});
    server.route({method: 'GET', path:'/__whatami', handler:function(request, reply) {
        reply().code(418);
    }});

    server.route ({method:'GET', path:'/_imgood', handler:(request, reply)=>reply(200)});
    server.route ({method:'GET', path:'/__health/{checknumber?}', handler : setupHealthCheck});
    var actualAppStart = server.start;
    
    server.start = function() {
        console.log(`Listening on  ${port}`);
        actualAppStart.apply(this, arguments);
    };
    return server;
}
var setupHealthCheck = function(request, reply) {
        var payload
		var checks = request.server.app.__healthchecks.map(function(check) {
			return check.getStatus();
		});
		if (checks.length === 0) {
			checks.push({
				name: 'App has no healthchecks',
				ok: false,
				severity: 3,
				businessImpact: 'If this application encounters any problems, nobody will be alerted and it probably will not get fixed.',
				technicalSummary: 'This app has no healthchecks set up',
				panicGuide: 'Don\'t Panic',
				lastUpdated: new Date()
			});
		}
		if (request.params[0]) {
			checks.forEach(function(check) {
				if (check.severity <= Number(request.params.checknumber) && check.ok === false) {
					reply.code(500);
				}
			});
		}

		//response.send();
    payload =JSON.stringify({
        schemaVersion: 1,
        name: 'CNN-' + request.app.__name,
        description: request.app.__description,
        checks: checks
    }, undefined, 2);
    var response = reply(payload);
    response.header('Cache-Control', 'private, no-cache, max-age=0');
    response.header('Content-Type', 'application/json');
};
module.exports.services = metrics.services;
module.exports.metrics = metrics;
