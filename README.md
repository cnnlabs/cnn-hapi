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
- Healthcheck on /healthcheck
- Basic logging
- Basic metrics


## Requirements

[Node 4.2.6+](https://npmjs.org)


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

Swagger documentation - localhost:5000/documentation

Healthcheck monitoring - localhost:5000/__health
