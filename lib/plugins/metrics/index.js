'use strict';
let debug = require('debug')('app:cnn-hapi:plugins:metrics');

exports.register = function (server, options, next) {
    let metrics = options.metrics;
    console.log('In Metrics Plugin');

    server.ext({
        type: 'onRequest',
        method: function (request, reply) {
            metrics.instrument(request, { as: 'http.request' });
            return reply.continue();
        }
    });
    server.ext({
        type: 'onPreResponse',
        method: function (request, reply) {
            var response = request.response.statusCode;

            metrics.instrument(request, { as: 'http.response' });
            return reply.continue();
        }
    });
    // server.on('response', function(request){
    //     var response = request.response.statusCode;
    //     console.log('HDS' + response)
        
    // })

    next();

};

exports.register.attributes = {
    name: 'cnn-metrics-hapi'
};
