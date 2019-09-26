'use strict';

const cwd = process.cwd();

module.exports = function(request, h) {
  return h
    .file(`${cwd}/views/robots.txt`)
    .type('text/plain')
    .header('Cache-Control', 'max-age:3600, public');
};
