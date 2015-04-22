var request = require('../api/base');
var users = require('../api/users');
var config = require('../../config');
var logger = require('../lib/logger');
var merge = require('../lib/merge');
var location = require('../lib/location');
var Queue = require('../lib/queue');
var events_path = 'events';

var eventsQueue = new Queue();
var eventTypes = {
    goal: 'goalAchieved',
    pageView: 'viewAppeared',
    pageClose: 'viewDisappeared',
    timeOnPage: 'viewTimeOnPage'
};

exports.types = eventTypes;

exports.timeOnPage = function(category, name, href, title, location, startDate) {
    var eventObject = defaultEventObject(eventTypes.timeOnPage);

    if (startDate && startDate.getTime) {
        var nowTime = (new Date()).getTime();
        var startTime = startDate.getTime();

        var timePast = (nowTime - startTime) / 1000;

        eventObject.val = timePast;
    }

    eventObject.vKey = name;
    eventObject.tKey = category;
    eventObject.tvKey = title;
    eventObject.tvCl = href;

    if (location)
        eventObject.data = merge(eventObject.data || {}, {
            _tl_view: location
        });

    return eventsQueue.enqueue(eventObject);
};

exports.scheduleTick = function() {
    setTimeout(flushQueue, config.obj().eventsFlushQueueTimeout);
};

exports.pageClose = function(category, name, href, title, location) {
    var eventObject = defaultEventObject(eventTypes.pageClose);

    eventObject.val  = (new Date()).toISOString();
    eventObject.vKey = name;
    eventObject.tKey = category;
    eventObject.tvKey = title;
    eventObject.tvCl = href;

    if (location)
        eventObject.data = merge(eventObject.data || {}, {
            _tl_view: location
        });
    
    return eventsQueue.enqueue(eventObject);
};

exports.pageView = function(category, name, attrs) {
    var eventObject = defaultEventObject(eventTypes.pageView);

    if (attrs)
        eventObject.data = merge(eventObject.data, attrs);

    eventObject.val = (new Date()).toISOString();
    eventObject.vKey = name;
    eventObject.tKey = category;

    return eventsQueue.enqueue(eventObject);
};

exports.goalAchieved = function(event_name, value, attrs) {
    var eventObject = defaultEventObject(eventTypes.goal);

    if (attrs)
        eventObject.data = merge(eventObject.data, attrs);

    if (value)
        eventObject.val = value;

    eventObject.gn = event_name;

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

function defaultEventObject(type) {
    return {
        type: type,
        date: (new Date()).toISOString(),
        tvKey: location.attr('title'),
        tvCl: location.attr('href'),
        prod: config.isProduction() ? 1 : 0,
        data: {
            _tl_view: location.toObject()
        }
    };
}

function flushQueue() {
    logger.log("Taplytics::events.flushQueue: tick.", eventsQueue, logger.DEBUG);

    var app = require('../app');

    if (!app || (app && !app.isReady())) 
        return scheduleTick();

    if (eventsQueue.isEmpty())
        return scheduleTick();

    // Flush eventsQueue.
    var events = eventsQueue.flush();
    var sessionID = app._in.session.getSessionID();

    // Queue up a session request if we don't have a session ID.
    if (!sessionID)
        users.post(app, {}, "Taplytics::events.flushQueue: failed to create sessions. Events will fail to process.");

    exports.post(app, events, function(err, response) {
        if (err) { // Something went wrong. Add them back to the queue!
            eventsQueue.enqueueAll(events);
        }

        scheduleTick();
    });
}
