'use strict';



module.exports = {
    /**
     * Validate that response header exists
     * @param {object} request
     */
    hasHeaders: function (request) {
        return request.response !== null &&
            typeof request.response === 'object' &&
            typeof request.response.header === 'function' &&
            true;
    }
};
