exports.register = (server, options, next) => {
    server.ext({
        type: 'onPreResponse',
        method: function (req, reply) {
            options.setCacheControlHeaders(req, {
                cacheControlHeader: options.cacheControlHeader,
                surrogateCacheControl: options.surrogateCacheControl
            });
            options.setCustomHeaders(req, options.customHeaders);
            return reply.continue();
        }
    });

    next();
};

exports.register.attributes = {
    name: 'cnn-hapi-onPreResponse'
};
