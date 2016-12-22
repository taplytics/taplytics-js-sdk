var log = require('../lib/logger');
var session = require('../lib/session');
var _ = require('../lib/tools');

module.exports = function(event_name, value, attrs) {
    if (!this.isReady()) {
        log.error("track: you have to call Taplytics.init first.", null, log.USER);
        return false;
    }
    if (!event_name) {
        log.error("track: you have to specify an event name.", null, log.USER);
        return false;
    }

    var val = value;
    var attributes = attrs;

    if (_.isObjectLike(value) && !attrs) { // for when function is used as (event_name, attrs)
        val = undefined;
        attributes = value;
    }

    if (val && !_.isNumber(val)) {
        log.error("track: if you're passing a value, it has to be a number.", null, log.USER);
        return false;
    }

    session.tick(); // tick the session

    this.api.events.goalAchieved(event_name, val, attributes);

    return this;
};
