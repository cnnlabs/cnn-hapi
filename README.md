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


## ENV VARS
`LOADER_IO_VALIDATION`
`PORT`
`LOCAL_TLS_PORT`
`CACHE_CONTROL`
`ENVIRONMENT`
`HOST`
`DEFAULT_MAX_LISTENERS`
`SURROGATE_CACHE_CONTROL`
`SHOW_CNN_HAPI_CONFIG`  => Setting this to 'true' will show server instance configurations on `server.start()`. Requires `DEBUG=cnn-hapi*` to be a part of `DEBUG` capture group
`METRICS_FLUSHEVERY`

## serverInstance(options)
_The following options override at the server level_
_options is an object that can take the following keys_
_Populate notes are in order of priority. Example: populate: `process.env.SOMEVALUE` || `options.someValue`. In that example if `process.env.SOMEVALUE` is not set it will default to `options.someValue`, etc, etc_
_Manual override possibilites are expressed in `options.someValue`_


`basePath`: project basePath,
`cacheControlHeader`: process.env.CACHE_CONTROL || 'max-age=60',
`customHeaders`: options.customHeaders || [],
`description`: options.description || `package.json` `description` key,
`environment`: process.env.ENVIRONMENT || process.env.NODE_ENV || options.environment || '',
`healthChecks`: options.healthChecks || [],
`host`: process.env.HOST || options.host || '0.0.0.0',
`loaderIoValidationKey`: options.loaderIoValidationKey || undefined,
`localTLS`: options.localTLS || null,
`maxListeners`: process.env.DEFAULT_MAX_LISTENERS || options.maxListeners || 10,
`name`: options.name || `package.json` `name` key,
`port`: process.env.PORT || options.port || 3000,
`surrogateCacheControl`:
    process.env.SURROGATE_CACHE_CONTROL || options.surrogateCacheControl || 'max-age=360, stale-while-revalidate=60, stale-if-error=86400',
`version`:options.version || `package.json` `version` key,
`withGoodConsole`: options.withGoodConsole || false,
`withSwagger`: options.withSwagger || false

## Override caching on individual routes

### Step 1
Wherever you are defining your `server.ext()` preferably in `server.js`...

```
const overrideCnnHapiDefaults = (request, reply) => {
    if (!request.someArbitraryKeyThatYouSet) {
        request.someArbitraryKeyThatYouSet = [];
    }
    // add override headers if they exist
    const overrides = request.someArbitraryKeyThatYouSet;
    try {
        if (Array.isArray(overrides)) {
            for (let i = 0; i < overrides.length; i++) {
                request.response.header(overrides[i].name, overrides[i].value);
            }
        }
    } catch (err) {
        debug(err);
    }
    return reply.continue();
}

server.ext('onPreResponse', overrideCnnHapiDefaults);
```


### Step 2
In `someRoute.js`...
```

const overrideHeaders = [
    {
        name: "X-SOME-HEADER",
        value: "baz"
    },
    {
        name: "X-FOO-HEADER",
        value: "bar"
    },
]

server.route({
    method: 'FOO',
    path: '/api/v1/foo/bar/{baz}',
    handler: function (request, reply) {
        // defined this key in STEP 1
        request.someArbitraryKeyThatYouSet = overrideHeaders;
        someHandler(request.params.baz, request)
            // stuff being handled
    .....

```

_For explicit usage check this implementation in `./example`_




