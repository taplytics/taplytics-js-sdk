var request = require('./base');
var users = require('./users');
var config = require('../../config');
var log = require('../lib/logger');
var merge = require('../lib/merge');
var location = require('../lib/location');
var Queue = require('../lib/queue');
var session = require('../lib/session');
var cookies = require('../lib/cookies');

var events_path = 'events';
var eventsQueue = new Queue();
var eventTypes = {
    active: 'appActive',
    terminate: 'appTerminate',
    config: 'tlClientConfig',
    fastConfig: 'tlFastModeConfig',
    goal: 'goalAchieved',
    pageView: 'viewAppeared',
    pageClose: 'viewDisappeared',
    timeOnPage: 'viewTimeOnPage'
};

exports.types = eventTypes;

exports.watchLifecycleEvents = function() {
    exports.appActive();

    var flushQueueFunc = flushQueue.bind(this);
    window.addEventListener('unload', function() {
        log.log("Window on unload", null, log.DEBUG);
        exports.appTerminate();
        saveQueueToLocalStorage();
    });
};

exports.timeOnPage = function(category, name, href, title, location, startDate) {
    var eventObject = defaultEventObject(eventTypes.timeOnPage);

    if (startDate && startDate.getTime) {
        var nowTime = (new Date()).getTime();
        var startTime = startDate.getTime();
        eventObject.val = (nowTime - startTime) / 1000;;
    }

    eventObject.vKey = name;
    eventObject.tKey = category;
    eventObject.tvKey = title;
    eventObject.tvCl = href;

    if (location) {
        eventObject.data = merge(eventObject.data || {}, {_tl_view: location});
    }

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
        eventObject.data = merge(eventObject.data || {}, {_tl_view: location});
    }

    return eventsQueue.enqueue(eventObject);
};

exports.pageView = function(category, name, attrs) {
    var eventObject = defaultEventObject(eventTypes.pageView);
    if (attrs) {
        eventObject.data = merge(eventObject.data, attrs);
    }

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
    return eventsQueue.enqueue(defaultEventObject(eventTypes.active));
};

exports.appTerminate = function() {
    return eventsQueue.enqueue(defaultEventObject(eventTypes.terminate))
};

function logTimeEvent(event, time) {
    var now = new Date();
    event.val = (now.getTime() - time.getTime()) / 1000.0;
    return eventsQueue.enqueue(event);
}

exports.clientConfig = function(time) {
    if (!time) return;
    return logTimeEvent(defaultEventObject(eventTypes.config), time);
};

exports.fastModeConfig = function(time) {
    if (!time) return;
    return logTimeEvent(defaultEventObject(eventTypes.fastConfig), time);
};

exports.post = function(events, callback) {
    var time = new Date();
    var params = {};
    var payloadDatum = function(even) {
        var sessionAttrs = {};
        sessionAttrs.sid = session.getSessionID();
        return {
            session: sessionAttrs,
            events: events
        };
    };

    request.post(events_path, params, payloadDatum, function(err, response) {
        if (!err)
            log.time("Taplytics::events.post: succesfully logged events.", response, time, log.DEBUG);
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
    var lsEvents = cookies.getLS(eventsQueueKey);
    if (lsEvents && lsEvents.length) {
        log.log("Add " + lsEvents.length + " events from local storage cache", null, log.DEBUG);
        events = events.concat(lsEvents);
        cookies.expire(eventsQueueKey, true);
    }

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

var eventsQueueKey = "_tl_eventsQueue";
function saveQueueToLocalStorage() {
    if (eventsQueue.isEmpty() || !session.hasLoadedData) return;
    var events = eventsQueue.flush();
    log.log("save " + events.length + " events to local storage", eventsQueue, log.DEBUG);
    cookies.setLS(eventsQueueKey, events);
}
