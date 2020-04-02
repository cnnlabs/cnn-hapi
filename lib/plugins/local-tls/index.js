'use strict';

module.exports = {
    name: 'cnn-hapi-local-tls',
    register: (server, options) => {
        const {port} = options;

        server.ext('onRequest', (request, h) => {
            const {
                info: {hostname},
                url: {path}
            } = request;
            const protocol = request.url.protocol.replace(/:/g, '');
            return (
                (protocol && protocol === 'http' && h.redirect(`https://${hostname}:${port}${path}`)) || h.continue
            );
        });
    }
};
