var logger = require('../lib/logger');
var session = require('../lib/session');

module.exports = function(event_name, value, attrs) {
    if (!this.isReady()) {
        logger.error("track: you have to call Taplytics.init first.", null, logger.USER);
        return false;
    }

    if (!event_name) {
        logger.error("track: you have to specify an event name.", null, logger.USER);
        return false;
    }

    var val = value;
    var attributes = attrs;

    if (isObjectLike(value) && !attrs) { // for when function is used as (event_name, attrs)
        val = undefined;
        attributes = value;
    }

    if (val && !isNumber(val)) {
        logger.error("track: if you're passing a value, it has to be a number.", null, logger.USER);
        return false;
    }
    

    session.tick(); // tick the session

    this.api.events.goalAchieved(event_name, val, attributes);

    return this;
};


function isNumber(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L9098
    var numberTag = '[object Number]';
    var objToString = Object.prototype.toString;
    
    return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
}

function isObjectLike(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L569
    return !!value && typeof value == 'object';
}
