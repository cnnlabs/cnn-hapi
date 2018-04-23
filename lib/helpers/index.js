'use strict';

module.exports = {
  /**
   * Validate that response header exists
   * @param {object} request
   */
  hasHeaders: (request) => {
    return (
      request.response !== null &&
      typeof request.response === 'object' &&
      typeof request.response.header === 'function' &&
      request
    );
  },

  /**
   * Determine if default headers should be set
   * @param {object} request
   */
  shouldSetDefaultCacheControl: (request = false) => {
    return (
      request &&
      typeof request.response.headers['cache-control'] === 'undefined' &&
      typeof request.route.settings.cache.expiresIn === 'undefined' &&
      typeof request.route.settings.cache.expiresAt === 'undefined'
    );
  }
};
