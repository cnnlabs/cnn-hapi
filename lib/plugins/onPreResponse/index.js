exports.register = (
  server,
  {cacheControlHeader, customHeaders = [], hasHeaders, shouldSetDefaultCacheControl, surrogateCacheControl},
  next
) => {
  server.ext({
    type: 'onPreResponse',
    method: function(request, reply) {
      if (shouldSetDefaultCacheControl(hasHeaders(request))) {
        request.response.header('Cache-Control', cacheControlHeader);
      }

      if (typeof hasHeaders(request) === 'object') {
        // surrogate-control can be overridden by route using reply.header({name:'surrogate-control', value:foo})
        if (typeof request.response.headers['surrogate-control'] === 'undefined') {
          request.response.header('Surrogate-Control', surrogateCacheControl);
        }

        // custom headers options should not be used to set cache-control or surrogate-control headers
        // they have there own options.
        customHeaders.length > 0 &&
          customHeaders
            .filter((header) => typeof header.name !== 'undefined' && typeof header.value !== 'undefined')
            .filter((header) => header.name !== 'Cache-Control')
            .filter((header) => header.name !== 'Surrogate-Control')
            .forEach((header) => request.response.header(header.name, header.value));
      }

      reply.continue();
    }
  });

  next();
};

exports.register.attributes = {
  name: 'cnn-hapi-onPreResponse'
};
