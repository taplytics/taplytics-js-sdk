var app = require('./app/app');

exports.obj = function() {
    var config = {};

    if (app.env !== 'production')
        config.baseAPI = "http://localhost:3002/public_api/v1/";
    else if (app.env === 'dev' || app.env === 'development')
        config.baseAPI = "https://dev.taplytics.com/public_api/v1/";
    else
        config.baseAPI = "https://taplytics.com/public_api/v1/";

    config.eventsFlushQueueTimeout = 4000;

    return config;
};


exports.isProduction = function() {
    return (app.env === 'production');
};
