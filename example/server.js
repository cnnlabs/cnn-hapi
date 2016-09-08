'use strict';


const path = require('path'),
    hapi = require('../init'), // hapi = require('cnn-hapi'),
    cnnhealth = require('cnn-health'),
    otherChecks = require('./config/otherchecks');



let healthChecks = cnnhealth(path.resolve(__dirname, './config/healthcheck')).asArray(),
    app,
    server = hapi.instance({
        basePath: __dirname,
        customHeaders: [{
            name: 'Connection',
            value: 'close'
        }],
        description: 'A Test Harness for building CNN-HAPI',
        healthChecks: healthChecks.concat(otherChecks),
        layoutsDir: 'views',
        maxAge: '10',
        name: 'testHarness',
        port: process.env.PORT,
        surrogateCacheControl: 'max-age=60, stale-while-revalidate=10, stale-if-error=6400',
        withSwagger: true,
        withGoodConsole: true
    });



/* get the default state of the server */
app = server.hapi;



/* load plugins registered by the core pkg */
app.register(server.pkgRegistry, (error) => {
    if (error) {
        console.error(error); process.exit(1);
    }
});

app.start(function serverStart() {
    console.log('info', 'Server running at ' + app.info.uri);
});