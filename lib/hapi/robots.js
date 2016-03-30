'use strict';

const fs = require('fs'),
    robots = fs.readFileSync(`${__dirname}/robots.txt`, {encoding: 'utf8'});

module.exports = function (request, reply) {
    if (reply.set && typeof reply.set === 'function') {
        reply.set({
            'Content-Type': 'text/plain',
            'Cache-Control': 'max-age:3600, public'
        });
    }

    if (reply.send && reply.send === 'function') {
        reply.send(robots);
    }
};
