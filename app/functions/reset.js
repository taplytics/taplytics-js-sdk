var logger = require('../lib/logger');
var api = require('../api');
var session = require('../lib/session');

module.exports = function(app) {
    return function() {
        if (!app.isReady()) {
            logger.error("Taplytics::reset: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }

        session.tick();

        api.users.del(app);

        session
            .deleteSessionID()
            .deleteAppUserID();

        api.users.post(app, {}, "Taplytics: couldn't create a new session/user. Taplytics will not function properly.");

        return app;
    };
};
