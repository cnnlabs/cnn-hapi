'use strict';
/**
 * @summary Auto register a route for easier loader.io validation.
 *
 * @description looks in the options param for a loaderIoValidationKey
 * and registers a root level route that will match and return
 * that value.
 *
 * The validation key is passed in as a property of the options
 * object by the app when constructing the cnn-hapi instance.
 * The property name is the same : loaderIoValidationKey
 *
 * See /example/app.js
 *
 *
 */

module.exports = {
  name: 'loaderio',
  register: function(server, options) {
    const loaderIoValidationKey = options.loaderIoValidationKey;

    server.route({
      method: 'GET',
      path: `/${loaderIoValidationKey}/`,
      handler: (request, h) => {
        return loaderIoValidationKey;
      }
    });
  }
};
