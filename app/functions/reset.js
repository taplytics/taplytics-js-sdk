var logger = require('../lib/logger');
var session = require('../lib/session');

module.exports = function() {
    if (!this.isReady()) {
        logger.error("Taplytics::reset: you have to call Taplytics.init first.", null, logger.USER);
        return false;
    }

    session.tick();

    this.api.users.del();

    session.deleteSessionID();
    session.deleteAppUserID();

    this.api.users.post({}, "Taplytics: couldn't create a new session/user. Taplytics will not function properly.");

    return this;
};
