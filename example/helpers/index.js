exports = module.exports = {
    setupHealthCheck: (request, reply) => {
        let payload,
            response,
            returnCode = 200,
            checks = request.server.app.__healthchecks.map((check) => {
                return check.getStatus();
            });

        if (checks.length === 0) {
            checks.push({
                name: 'App has no healthchecks',
                ok: false,
                severity: 3,
                businessImpact: 'If this application encounters any problems, nobody will be alerted and it probably will not get fixed.',
                technicalSummary: 'This app has no healthchecks set up',
                panicGuide: 'Yes. Panic',
                lastUpdated: new Date()
            });
        }

        if (request.params.checknumber) {
            checks.forEach(function (check) {
                if (check.severity <= Number(request.params.checknumber) && check.ok === false) {
                    returnCode = 500;
                }
            });
        }

        payload = JSON.stringify({
            schemaVersion: 1,
            name: `CNN-${request.server.app.__name}`,
            description: request.server.app.__description,
            checks: checks
        }, null, 2);

        response = reply(payload).code(returnCode);
        response.header('Cache-Control', 'private, no-cache, max-age=0');
        response.header('Content-Type', 'application/json');

    }
}