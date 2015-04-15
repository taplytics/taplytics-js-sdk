var logger = require('../lib/logger');
var events_path = 'events';

module.exports = function(api) {
	return {
        queue: queue,
        post: post
	};
};

var eventsQueue = [];

function queue(event_name, value, attrs) {
    var eventObject = {
        name: event_name,
        value: value,
        attrs: attrs
    };

    return addEventsToQueue([eventObject]);
}

function post(events, callback) {
    var params = {
        public_token: app._in.token
    };

    var payloadDatum = function(even) {
        var session = {};

        session.sid = app._in.session.getSessionID();

        var payload = {
            session: session,
            events: events
        };
        return payload;
    };

    api.post(users_path, params, payloadDatum, function(err, response) {
        if (!err)
            logger.log("Taplytics::events.post: succesfully logged events.", response, logger.DEBUG);
        else
            logger.error("Taplytics::events.post: failed to log events", err, logger.LOG);

        return callback && callback(err, response);
    });
}

function flushQueue(app) {
    var events = eventsQueue.slice();

    // Flush eventsQueue:
    eventsQueue = [];

    var sessionID = app._in.session.getSessionID();

    // Queue up a session request if we don't have one.
    if (!sessionID)
        api.users.post(app, {}, "Taplytics::events.flushQueue: failed to create sessions. Events will fail to process.", logger.LOG);

    post(events, function(err, response) {
        if (err) { // Something went wrong. Add them back to the queue!
            addEventsToQueue(events);
        }
    });
}


// Helpers

function addEventsToQueue(events) {
    if (!events || typeof events !== "array")
        return false;

    var eventIndex = 0;

    for (eventIndex = 0; eventIndex < events.length; eventIndex++) {
        var eventObject = events[eventIndex];

        eventsQueue.push(eventObject);
    }
}
