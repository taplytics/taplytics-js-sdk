var log = require('../lib/logger');
var session = require('../lib/session');

module.exports = function() {
    if (!this.isReady()) {
        log.error("Taplytics::reset: you have to call Taplytics.init first.", null, log.USER);
        return false;
    }

    session.tick();

    this.api.users.del();

    session.resetSession();

    this.api.config.get();

    return this;
};
