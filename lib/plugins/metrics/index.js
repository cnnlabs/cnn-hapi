'use strict';

exports.register = function (server, options, next) {
    let metrics = options.metrics;
    console.log('In Metrics Plugin');

    server.ext({
        type: 'onRequest',
        method: function (request, reply) {
            metrics.instrument(request, {as: 'http.request'});
            return reply.continue();
        }
    });
    server.ext({
        type: 'onPreResponse',
        method: function (request, reply) {
            metrics.instrument(request, {as: 'http.response'});
            return reply.continue();
        }
    });

    next();
};

exports.register.attributes = {
    name: 'cnn-metrics-hapi'
};
