'use strict';

let returnExport =  {
    name: 'APIs',
    description: 'External Health used by Service',
    checks: [
        {
            name: 'PlatformAPI HealthChecks',
            severity: 2,
            businessImpact: 'API may not be able to serve',
            technicalSummary: 'Tries to query the PlatformAPI endpoint',
            panicGuide: 'Dont Know yet',
            type: 'json',
            url: 'http://www.cnn.com/_healthcheck',
            callback: (version) => version,
            checkResult: {
                PASSED: 'Successful response from the  endpoint',
                FAILED: 'Bad response from the endpoint',
                PENDING: 'This test has not yet run'
            }
        }
    ]
};

module.exports = returnExport;
