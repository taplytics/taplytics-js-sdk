exports.obj = function() {
    var app = require('./app/app');
    var config = {};

    if (app.env === 'production')
        config.baseAPI = "https://api.taplytics.com/public_api/v1/";
    else if (app.env === 'dev' || app.env === 'development')
        config.baseAPI = "https://dev.taplytics.com/public_api/v1/";
    else if (app.env === 'local')
        config.baseAPI = "https://api.taplytics.com/public_api/v1/";

    config.eventsFlushQueueTimeout = 4000;

    config.functionFlushQueueTimeout = 500;

    return config;
};

exports.isProduction = function() {
    var app = require('./app/app');
    return (app.env === 'production');
};
