var port = process.env.PORT || 3000;
var hapi = require('../main');
var path =require('path');
var debug = require('debug')('example');
var cnnhealth = require('cnn-health');

const healthChecks = cnnhealth(path.resolve(__dirname, './config/healthcheck'));
var app = module.exports = hapi({
    directory: __dirname,
    port:8080,
    withSwagger:true,
    withNavigation: false,
    layoutsDir: __dirname + '/views/',
    healthChecks: healthChecks.asArray()
});

app.route({method:'GET', path:'/', handler:function(request, reply) {
    reply('Hello router');
}});

app.start(function(){
    console.log('App Starting');
})