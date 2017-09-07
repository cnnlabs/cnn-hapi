exports.register = (server, options, next) => {
    const {
        port
    } = options;

    server.ext('onRequest', (request, reply) => {
        const {
            connection: {info: { protocol }},
            info: { hostname },
            url: { path }
        } = request;

        return protocol && protocol === 'http' && reply.redirect(
            `https://${hostname}:${port}${path}`
        ) || reply.continue();
    });

    next();
};

exports.register.attributes = {
    name: 'cnn-hapi-local-tls'
};
