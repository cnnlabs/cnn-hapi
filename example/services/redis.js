module.exports = () => {
    const redis = require('redis');

    return {
        start: (server, next) => {
            this.client = redis.createClient();

            this.client.on('error', (error) => console.log(`Error: ${error}`));
            this.client.set('fooze', 'bar');

            next();
        },
        stop: (server, next) => {
            this.client.quit();
            next();
        }
    };
};
