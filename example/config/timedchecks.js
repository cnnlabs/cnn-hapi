'use strict';
const nHealth = require('cnn-health');
const debug = require('debug')('checks');
const INTERVAL = 50 * 1000;

const statuses = {
    testURL: false
};
function pingServices(){

    fetch('http://api.platform.cnn.com/health')
	.then((res) => { statuses.testURL = res.ok; debug(res.ok);})
	.catch(() => { statuses.testURL = false; });
}
function testStatus() {
	return {
		getStatus: () => ({
			name: 'api.client.cnn.com responded successfully.',
			ok: statuses.testURL,
			businessImpact: 'Users may not see comments at bottom of article',
			severity: 3,
			panicGuide: '',
			technicalSummary: 'Fetches the session-user-data call used on the client side to initialise comments'
		})
	};
}


module.exports = {
	init: function() {
		debug('Starting Pinging of HealthChecks');
	    pingServices();
		setInterval(pingServices, INTERVAL);
	},
	testStatus:testStatus
}