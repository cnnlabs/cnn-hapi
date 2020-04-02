'use strict';

const intercept = require('intercept-stdout');

module.exports = {
    name: 'hapi-livelogger',
    register: function(server, options) {
        const io = require('socket.io')(server.listener);
        io.on('connection', (socket) => {
            intercept((text) => socket.send(text));
        });
    }
};
