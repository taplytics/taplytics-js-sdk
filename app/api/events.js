var api = require('../api');
var config = require('../../config');
var logger = require('../lib/logger');
var Queue = require('../lib/queue');
var events_path = 'events';

var eventsQueue = new Queue();
var eventTypes = {
    goal: 'goalAchieved'
};


exports.types = eventTypes;

exports.goalAchieved = function(event_name, value, attrs) {
    var eventObject = {
        type: eventTypes.goal,
        gn: event_name,
        date: (new Date()).toISOString(),
        val: value,
        data: attrs,
        lv: 1 // TODO: enviornment handling
    };

    return eventsQueue.enqueue(eventObject);
};

exports.post = function(app, events, callback) {
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

    api.request.post(events_path, params, payloadDatum, function(err, response) {
        if (!err)
            logger.log("Taplytics::events.post: succesfully logged events.", response, logger.DEBUG);
        else
            logger.error("Taplytics::events.post: failed to log events", err, logger.LOG);

        return callback && callback(err, response);
    });
};

// Internal functions

function flushQueue() {
    logger.log("Taplytics::events.flushQueue: tick.", eventsQueue, logger.DEBUG);

    var app = window.Taplytics;

    if (!app || (app && !app.isReady())) 
        return scheduleTick();

    if (eventsQueue.isEmpty())
        return scheduleTick();

    // Flush eventsQueue.
    var events = eventsQueue.flush();
    var sessionID = app._in.session.getSessionID();

    // Queue up a session request if we don't have a session ID.
    if (!sessionID)
        api.users.post(app, {}, "Taplytics::events.flushQueue: failed to create sessions. Events will fail to process.", logger.LOG);

    post(app, events, function(err, response) {
        if (err) { // Something went wrong. Add them back to the queue!
            eventsQueue.enqueueAll(events);
        }

        scheduleTick();
    });
}

function scheduleTick() {
    setTimeout(flushQueue, config.eventsFlushQueueTimeout);
}

// Initiate flushQueue:

scheduleTick();