exports.register = (server, options, next) => {
    server.ext({
        type: 'onPreStart',
        method: options.services.map((service) => service.start)
    });

    next();
};

exports.register.attributes = {
    name: 'cnn-hapi-onPreStart'
};
