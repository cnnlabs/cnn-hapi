'use strict';

module.exports = {
  name: 'cnn-metrics-hapi',
  register: function(server, options) {
    const metrics = options.metrics.provider;
    const metricOptions = {};

    metricOptions.appName = options.name;
    metricOptions.flushEvery = options.flushEvery;
    metrics.init(metricOptions);

    server.ext('onRequest', (request, h) => {
      metrics.instrument(request, {as: 'http.request'});
      return h.continue;
    });

    server.ext('onPreResponse', (request, h) => {
      metrics.instrument(request, {as: 'http.response'});
      return h.continue;
    });
  }
};
