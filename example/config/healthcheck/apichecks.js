const debug = require('debug')('check');

module.exports = {
    name: 'json check fixture',
    description: 'json check fixture description',
    checks: [
        {
            type: 'json',
            name: 'CNN Homepage',
            url: 'http://www.cnn.com/_healthcheck',
            severity: 2,
            businessImpact: 'Its a HUGE deal',
            technicalSummary: 'god knows',
            panicGuide: 'Don\'t Panic',
            checkResult: {
                PASSED: 'Version Passed',
                FAILED: 'Version Failed',
                PENDING: 'This check has not yet run'
            },
            interval: '3s',
            callback: function (json) {
                debug('Hello');
                debug(json);
                return true;
            }
        }
    ]
};
