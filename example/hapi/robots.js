'use strict';

const cwd = process.cwd();

module.exports = function(request, reply) {
  reply
    .file(`${cwd}/example/views/robots.txt`)
    .type('text/plain')
    .header('Cache-Control', 'max-age:3600, public');
};
