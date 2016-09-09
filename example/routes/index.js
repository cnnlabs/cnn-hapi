
const robots = require('../../lib/hapi/robots'),
    setupHealthCheck = require('../helpers').setupHealthCheck;

exports = module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
            reply('Hello router');
        }
    },
    {
        method: 'GET',
        path: '/robots.txt',
        handler: robots
    },
    {
        method: 'GET',
        path: '/__whatami',
        handler: (request, reply) => {
            reply().code(418);
        }
    },
    {
        method: 'GET',
        path: '/_imgood',
        handler: (request, reply) => reply(200)
    },
    {
        method: 'GET',
        path: '/__health/{checknumber?}',
        handler: setupHealthCheck
    }
];