var config = {};

if (process.env.NODE_ENV !== 'production')
    config.baseAPI = "http://localhost:3002/public_api/v1/";
else
    config.baseAPI = "https://taplytics.com/public_api/v1/";

config.eventsFlushQueueTimeout = 4000;

module.exports = config;
