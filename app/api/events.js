var request = require('./base');
var users = require('./users');
var config = require('../../config');
var log = require('../lib/logger');
var merge = require('../lib/merge');
var location = require('../lib/location');
var Queue = require('../lib/queue');
var session = require('../lib/session');

var events_path = 'events';
var eventsQueue = new Queue();
var eventTypes = {
    active: 'appActive',
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
    var flushQueueFunc = flushQueue.bind(this);
    setTimeout(flushQueueFunc, config.obj().eventsFlushQueueTimeout);
};

exports.pageClose = function(category, name, href, title, location) {
    var eventObject = defaultEventObject(eventTypes.pageClose);

    eventObject.val  = (new Date()).toISOString();
    eventObject.vKey = name;
    eventObject.tKey = category;
    eventObject.tvKey = title;
    eventObject.tvCl = href;

    if (location) {
        eventObject.data = merge(eventObject.data || {}, {
            _tl_view: location
        });
    }

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

exports.appActive = function() {
    var eventObject = defaultEventObject(eventTypes.active);
    return eventsQueue.enqueue(eventObject);
};

exports.post = function(events, callback) {
    var params = {};

    var payloadDatum = function(even) {
        var sessionAttrs = {};
        sessionAttrs.sid = session.getSessionID();

        var payload = {
            session: sessionAttrs,
            events: events
        };
        return payload;
    };

    request.post(events_path, params, payloadDatum, function(err, response) {
        if (!err)
            log.log("Taplytics::events.post: succesfully logged events.", response, log.DEBUG);
        else
            log.error("Taplytics::events.post: failed to log events", err, log.LOG);

        return callback && callback(err, response);
    });
};

//
// Internal functions
//
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
    log.log("events.flushQueue: tick.", eventsQueue, log.LOUD);
    if (eventsQueue.isEmpty() || !session.hasLoadedData)
        return exports.scheduleTick();

    // Flush eventsQueue.
    var events = eventsQueue.flush();
    var sessionID = session.getSessionID();

    // Queue up a session request if we don't have a session ID.
    if (!sessionID)
        users.post({}, "Taplytics::events.flushQueue: failed to create sessions. Events will fail to process.");

    this.post(events, function(err, response) {
        if (err) { // Something went wrong. Add them back to the queue!
            eventsQueue.enqueueAll(events);
        }

        exports.scheduleTick();
    });
}
