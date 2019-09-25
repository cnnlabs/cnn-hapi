'use strict';

const intercept = require('intercept-stdout');

module.exports = {
  name: 'hapi-livelogger',
  register: function(server, options) {
    let io = require('socket.io')(server.listener);

    io.on('connection', function(socket) {
      intercept((text) => {
        socket.send(text);
      });
    });
  }
};
