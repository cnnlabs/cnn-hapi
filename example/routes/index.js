'use strict';



const robots = require('../hapi/robots');
const setupHealthCheck = require('../hapi/setupHealthCheck');

module.exports = [
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
    },
    {
        method: 'GET',
        path: '/__handlebarsTest',
        handler: (request, reply) => {
            reply.view('handlebars/index', {body: 'World!', title: 'Hello'});
        }
    }
];
