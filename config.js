exports.obj = function() {
    var app = require('./app/app');
    var config = {
        cdnAPI: "https://cdn-config.taplytics.com/js/"
    };

    if (app.env === 'production') {
        config.baseAPI = "https://api.taplytics.com/public_api/v1/";
        config.eventsAPI = "https://ping.taplytics.com/public_api/v1/";
    } else if (app.env === 'dev' || app.env === 'development') {
        config.baseAPI = "https://dev.taplytics.com/public_api/v1/";
    } else if (app.env === 'stag' || app.env === 'staging') {
        config.baseAPI = "https://staging.taplytics.com/public_api/v1/";
    } else if (app.env === 'local') {
        config.baseAPI = "http://localhost:3002/public_api/v1/";
        // config.cdnAPI = "http://localhost:3000/";
    }

    config.eventsFlushQueueTimeout = 4000;

    config.functionFlushQueueTimeout = 500;

    config.sdkVersion = "1.2.3";

    return config;
};

exports.isProduction = function() {
    var app = require('./app/app');
    return (app.env === 'production');
};
