const path = require('path'),
    hapi = require('../main'),
    cnnhealth = require('cnn-health'),
    healthChecks = cnnhealth(path.resolve(__dirname, './config/healthcheck'));

let app = module.exports = hapi({
    directory: __dirname,
    port: process.env.PORT,
    withSwagger: true,
    withNavigation: false,
    layoutsDir: `${__dirname}/views/`,
    healthChecks: healthChecks.asArray()
});

app.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello router');
    }
});

app.start(function () {
    console.log('App Starting');
});
