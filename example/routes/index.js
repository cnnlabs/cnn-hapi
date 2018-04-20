'use strict';

const robots = require('../hapi/robots');
const setupHealthCheck = require('../helpers').setupHealthCheck;

module.exports = [
  {
    method: 'GET',
    path: '/hello-router',
    handler: (request, reply) => {
      reply('Hello router').header('Cache-Control', 'max-age=130');
    },
    config: {
      cache: {
        privacy: 'private'
      },
      description: '.header() overrides only work for certain',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/default-cache',
    handler: (request, reply) => {
      reply('Hello router');
    },
    config: {
      description: 'View Response Headers in swagger docs to see default cache configuration',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/override-headers',
    handler: (request, reply) => {
      reply('Peep the response headers in swagger docs')
        .header('Cache-Control', '2')
        .header('Surrogate-Control', 'poop');
    },
    config: {
      description: 'Example route for demonstrating how to  override headers by route',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    handler: robots,
    config: {
      description: 'Abstracted handler function implementation',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/__whatami',
    handler: (request, reply) => {
      reply().code(418);
    },
    config: {
      description: 'Sending success code implementation',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/_imgood',
    handler: (request, reply) => reply(200),
    config: {
      description: 'Another implementation of replying',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/__health/{checknumber?}',
    handler: setupHealthCheck,
    config: {
      description: 'Healthcheck route',
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/__handlebarsTest',
    handler: (request, reply) => {
      reply.view('handlebars/index', {body: 'World!', title: 'Hello'});
    },
    config: {
      description: 'Test Handlebars implementation',
      tags: ['api']
    }
  }
];
