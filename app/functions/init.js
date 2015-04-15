var logger = require('../lib/logger');
var api = require('../api');


module.exports = function(app) {
    return function(token, options) {
        if (!isValidToken(token)) {
            logger.error("Taplytics: an SDK token is required.", null, logger.USER);
            return undefined;
        }

        if (options) {
            if (options.log_level)
                logger.setPriorityLevel(options.log_level);
        }

        // Instatiate accessible stuff:

        app._in = {}; // internal

        app._in.token   = token;
        app._in.session = require('../session')(app);
        app._in.logger  = logger; // In case we want to override log level ourselves

        app._in.session.start();

        api.users.createUser(app, {}, "Taplytics: Init failed. Taplytics will not function properly.");
        return app;
    };
};

// Helper functions

function isValidToken(token) {
    if (!token)
        return false;

    if (typeof token !== "string")
        return false;

    if (!token.length)
        return false;

    return true;
}