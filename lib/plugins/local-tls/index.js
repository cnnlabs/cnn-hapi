module.exports = {
  name: 'cnn-hapi-local-tls',
  register: (server, options) => {
    const {port} = options;

    server.ext('onRequest', (request, h) => {
      const {
        connection: {
          info: {protocol}
        },
        info: {hostname},
        url: {path}
      } = request;

      return (
        (protocol && protocol === 'http' && h.redirect(`https://${hostname}:${port}${path}`)) || h.continue
      );
    });
  }
};
