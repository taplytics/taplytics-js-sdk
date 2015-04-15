var logger = require('../lib/logger');
var api = require('../api');
var location = require('../lib/location');
var platform = require('platform');
var source = require('../lib/source');

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

        createUser(app);

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

// Request functions

function createUser(app) {
    var locationData = location(); // document.location
    var sourceData = source(); // documen.referrer + location.search
    var appUser = {};
    var session = {};

    session.sid = app._in.session.getSessionID();
    session.ad  = app._in.session.getSessionUUID();
    session.adt = 'browser';
    session.ct  = 'browser';
    session.lv  = false;
    session.rfr = sourceData.referrer;
    session.prms = {
        search: sourceData.search,
        location: locationData,
        platform: platform
    };

    if (platform) {
        session.os = platform.os.family;
        session.osv = platform.os.version;
        session.ma = platform.manufacturer;
        session.br = platform.product;
        session.bron = platform.name;
        session.brov = platform.version;
        session.brol = platform.layout;
    }

    appUser.auid = app._in.session.getAppUserID();

    var params = {
        public_token: app._in.token
    };

    var payload = {
        session: session,
        app_user: appUser
    };

    logger.log("Taplytics::init.createUser", payload);
    api.users.post(params, payload, function(err, response) {
        if (err) {
            logger.error("Taplytics: Init failed. Taplytics is currently not working.", err, logger.USER);
        } else {
            var data = response.body;

            if (data) {
                logger.log("Taplytics::init.createUser: successfully created user.", response, logger.DEBUG);

                var appUserID = data.app_user_id;
                var sessionID = data.session_id;

                app._in.session.setAppUserID(appUserID);
                app._in.session.setSessionID(sessionID);
                app._in.session.tick();
            } else {
                logger.error("Taplytics: Init failed. Taplytics is currently not working.", null, logger.USER);
            }
        }
    });  
}