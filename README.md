# CNN Hapi

Basic [Hapi](http://hapijs.com/) server with some baked in features that can be
pulled in as a dependency of another application to extend as needed.

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

Look at the example/app.js to see an example of how this can be pulled in as a
dependency.  You can see it running by doing the following.

```shell
$ PORT=5000 node example/app.js
HttpResponse { buckets: {}, reporter: [Function: bound ] }
{ app: 'hapi-demo-app', flushEvery: 6000 }
In Metrics Plugin
Listening on  5000
App Starting
Logging to Graphite is disabled by default on non-production environments. To enable is set NODE_ENV to "production". Or set DEBUGMETRICS=1 to debug metric counters
Logging to Graphite is disabled by default on non-production environments. To enable is set NODE_ENV to "production". Or set DEBUGMETRICS=1 to debug metric counters
Logging to Graphite is disabled by default on non-production environments. To enable is set NODE_ENV to "production". Or set DEBUGMETRICS=1 to debug metric counters
```

You can also navigate to localhost:5000 and see a served page.  Also check out
localhost:5000/documentation and localhost:5000/healthcheck.


## Contributing

If you would like to contribute, just fork and submit a pull request.  Please
review the [contributing guidelines](./CONTRIBUTING.md)
first.


## Project Owner

TBD is the current Project Owner of this repository.
