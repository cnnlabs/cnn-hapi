# CNN Hapi

Basic [Hapi](http://hapijs.com/) server with some baked in features that can be
pulled in as a dependency of another application to extend as needed.

[![build](https://img.shields.io/travis/cnnlabs/cnn-hapi/master.svg?style=flat-square)](https://travis-ci.org/cnnlabs/cnn-hapi)
![node](https://img.shields.io/node/v/cnn-hapi.svg?style=flat-square)
[![npm](https://img.shields.io/npm/v/cnn-hapi.svg?style=flat-square)](https://www.npmjs.com/package/cnn-hapi)
[![npm-downloads](https://img.shields.io/npm/dm/cnn-hapi.svg?style=flat-square)](https://www.npmjs.com/package/cnn-hapi)
[![dependency-status](https://gemnasium.com/cnnlabs/cnn-hapi.svg)](https://gemnasium.com/cnnlabs/cnn-hapi)

Features include:

- Swagger on /documentation
- Basic healthcheck on /__health
- Basic logging
- Basic metrics
- Basic process monitoring
- Default Cache/Surrogate Control headers
- Default custom headers


## Requirements

[Node 6.0.0+](https://npmjs.org)


## Installation

```shell
$ npm install
```


## Usage

Look at the [/example/app.js](./example/app.js) to see an example of how this
can be pulled in as a dependency.  You can see it running by doing the
following.

```shell
$ PORT=5000 node example/app.js
info Server running at http://0.0.0.0:5000
info Server name: testHarness
info Server version: 0.1.0
info Server maxListeners: 1000
info Server environment: development
info Server in debug mode: true
160915/014027.438, [ops] memory: 65Mb, uptime (seconds): 5.705, load: [1.30322265625,1.486328125,1.5888671875]
160915/014032.438, [ops] memory: 58Mb, uptime (seconds): 10.706, load: [1.35888671875,1.49462890625,1.5908203125]
```

You can also navigate to localhost:5000 and see a served page.

Swagger documentation - `localhost:5000/documentation`

Healthcheck monitoring - `localhost:5000/__health`

## Testing
`$ cd <cnn-hapi-root>`
`$ npm run example-server`
This will run the example server in the `./example` directory.

## ENV VARS
+ `LOADER_IO_VALIDATION`

+ `PORT`

+ `LOCAL_TLS_PORT`

+ `CACHE_CONTROL`

+ `ENVIRONMENT`

+ `HOST`

+ `DEFAULT_MAX_LISTENERS`

+ `SURROGATE_CACHE_CONTROL`

+ `SHOW_CNN_HAPI_CONFIG`  => Setting this to 'true' will show server instance configurations on `server.start()`. Requires `DEBUG=cnn-hapi*` to be a part of `DEBUG` capture group<br>

+ `METRICS_FLUSHEVERY`<br>


## serverInstance(options)
_The following options set defaults at the server level and can override CNN-Hapi Defaults_
_Populate notes are in order of priority. Example: populate: `process.env.SOMEVALUE` || `options.someValue`. In that example if `process.env.SOMEVALUE` is not set it will default to `options.someValue`, etc, etc_
_Manual override possibilites are expressed in `options.someValue`_

_`options` is an object that can take the following keys_

+ `basePath`: project basePath,

+ `cacheControlHeader`: process.env.CACHE_CONTROL || 'max-age=60',

+ `customHeaders`: options.customHeaders || [],

+ `description`: options.description || `package.json` `description` key,

+ `environment`: process.env.ENVIRONMENT || process.env.NODE_ENV || options.environment || '',

+ `healthChecks`: options.healthChecks || [],

+ `host`: process.env.HOST || options.host || '0.0.0.0',

+ `loaderIoValidationKey`: options.loaderIoValidationKey || undefined,

+ `localTLS`: options.localTLS || null,

+ `maxListeners`: process.env.DEFAULT_MAX_LISTENERS || options.maxListeners || 10,

+ `name`: options.name || `package.json` `name` key,

+ `port`: process.env.PORT || options.port || 3000,

+ `surrogateCacheControl`:
    process.env.SURROGATE_CACHE_CONTROL || options.surrogateCacheControl || 'max-age=360, stale-while-revalidate=60, stale-if-error=86400',

+ `version`:options.version || `package.json` `version` key,

+ `withGoodConsole`: options.withGoodConsole || false,

+ `withSwagger`: options.withSwagger || false

## Override caching on individual routes
_Using the reply.header() function can set headers on a singular route_

```
{
    method: 'GET',
    path: '/override-headers',
    handler: (request, reply) => {
      reply('Peep the response headers in swagger docs')
      .header('Cache-Control', '2')
      .header('Surrogate-Control', 'baz');
    },
    config: {
      description: 'Example route for demonstrating how to  override headers by route',
      tags: ['api']
    }
  },
  ```
_For explicit usage check this implementation in `./example/routes`_


# Test

`$ npm run example-server`

It runs example server located in `./example`. Pass in ENV vars through the above command or hardcode into the package.json located in the `./example` directory.

Go to {HOST}:{PORT}/documentation to view the new swagger docs and to test current `CNN-Hapi` logic.

