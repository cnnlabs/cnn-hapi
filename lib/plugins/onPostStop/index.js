exports.register = (server, options, next) => {
    server.ext({
        type: 'onPostStop',
        method: options.services.map((service) => service.stop)
    });

    next();
};

exports.register.attributes = {
    name: 'cnn-hapi-onPostStop'
};
