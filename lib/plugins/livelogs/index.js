'use strict';

const intercept = require('intercept-stdout');

exports.register = function(server, options, next) {
  let io = require('socket.io')(server.listener);

  io.on('connection', function(socket) {
    intercept(function(text) {
      socket.send(text);
    });
  });

  next();
};

exports.register.attributes = {
  name: 'hapi-livelogger'
};
