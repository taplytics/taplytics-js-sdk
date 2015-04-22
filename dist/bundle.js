(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js":[function(require,module,exports){
exports.request = require('./api/base');
exports.users = require('./api/users');
exports.events = require('./api/events');
},{"./api/base":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/base.js","./api/events":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/events.js","./api/users":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/users.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/base.js":[function(require,module,exports){
var request = require('superagent');
var config = require('../../config');
var logger = require('../lib/logger');
var Queue = require('../lib/queue');
var Qs = require('qs');


exports.get  = queueRequest(getRequest);
exports.post = queueRequest(postRequest);
exports.del  = queueRequest(deleteRequest);

var requestsQueue = new Queue();
var isRequesting = false;

// Requests
function getRequest(path, queryDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum); 
    var url = assembleURL(path);

    request
        .get(url)
        .query(params.query)
        .end(callbackWrapper(url, cb));
}

function postRequest(path, queryDatum, payloadDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum, payloadDatum);   
    var url = assembleURL(path);

    request
        .post(url)
        .query(params.query)
        .send(params.payload)        
        .end(callbackWrapper(url, cb));
}

function deleteRequest(path, queryDatum, payloadDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum, payloadDatum);
    var url = assembleURL(path);

    request
        .del(url)
        .query(params.query)
        .send(params.payload)
        .end(callbackWrapper(url, cb));
}

// Processing

function callbackWrapper(url, cb) {
    return function(err, res) {
        if (err)
            logger.error("Error: " + url, err, logger.DEBUG);

        if (cb && typeof cb === 'function')
            cb(err, res);

        processQueue();
    };
}

function queueRequest(requestFunction) {
    return function() {
        requestsQueue.enqueue({
            requestFunction: requestFunction,
            args: arguments
        });

        if (!isRequesting)
            processQueue();
    };
}

function processQueue() {
    if (!requestsQueue.isEmpty()) {
        isRequesting = true;

        var queueItem = requestsQueue.dequeue();

        logger.log("Processing request", queueItem, logger.DEBUG);
        return queueItem && queueItem.requestFunction && queueItem.requestFunction.apply(undefined, queueItem.args);
    } else {
        isRequesting = false;
    }
}

// Helper Methods

function assembleURL(path, query) {
    return config.obj().baseAPI + (path || '') + queryString(query);
}

function queryString(query) {
    if (!query) return '';

    return "?" + Qs.stringify(query);
}

function getRequestQueryAndPayload(queryDatum, payloadDatum) {
    var query = {};
    var payload = {};

    if (queryDatum && typeof queryDatum == "function")
        query = queryDatum();
    else
        query = queryDatum;

    if (payloadDatum && typeof payloadDatum == "function")
        payload = payloadDatum();
    else
        payload = payloadDatum;

    return {
        query: query,
        payload: payload
    };
}

},{"../../config":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/config.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js","../lib/queue":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/queue.js","qs":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/index.js","superagent":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/lib/client.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/events.js":[function(require,module,exports){
var api = require('../api');
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
        api.users.post(app, {}, "Taplytics::events.flushQueue: failed to create sessions. Events will fail to process.");

    exports.post(app, events, function(err, response) {
        if (err) { // Something went wrong. Add them back to the queue!
            eventsQueue.enqueueAll(events);
        }

        scheduleTick();
    });
}

function scheduleTick() {
    setTimeout(flushQueue, config.obj().eventsFlushQueueTimeout);
}

// Initiate flushQueue:

scheduleTick();

},{"../../config":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/config.js","../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/location":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/location.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js","../lib/merge":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/merge.js","../lib/queue":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/queue.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api/users.js":[function(require,module,exports){
var location = require('../lib/location');
var source = require('../lib/source');
var logger = require('../lib/logger');
var api = require('../api');
var config = require('../../config');

var users_path = 'users';

// Requests

exports.del = function(app, callback) {
    var appUserID = app._in.session.getAppUserID();

    if (!appUserID)
        return;

    var session = {};

    session.sid = app._in.session.getSessionID();
    session.ad  = app._in.session.getSessionUUID();

    var params = {
        public_token: app._in.token
    };

    var payload = {
        session: session
    };

    logger.log("users_del", payload, logger.DEBUG);

    api.request.del(users_path + "/" + appUserID, params, payload, function(err, response) {
        if (err)
            logger.error("Taplytics: Couldn't properly rest user.", response, logger.DEBUG);
        else
            logger.log("Taplytics: successfully reset the user.", response, logger.DEBUG);
        
        return callback && callback(err, response);
    });
};

exports.post = function(app, user_attrs, failure_message, callback) {
    var locationData = location.toObject(); // document.location
    var sourceData = source(); // documen.referrer + location.search
    var appUser = user_attrs;
    var session = {};

    if (!appUser)
        appUser = {};

    session.sid = app._in.session.getSessionID();
    session.ad  = app._in.session.getSessionUUID();
    session.adt = 'browser';
    session.ct  = 'browser';
    session.lv  = config.isProduction() ? '0' : '1';
    session.rfr = sourceData.referrer;

    session.exm = sourceData.search.utm_medium;
    session.exs = sourceData.search.utm_source;
    session.exc = sourceData.search.utm_campaign;
    session.ext = sourceData.search.utm_term;
    session.exct = sourceData.search.utm_content;

    session.prms = {
        search: sourceData.search,
        location: locationData,
        userAgent: navigator.userAgent
    };

    appUser.auid = app._in.session.getAppUserID();

    var params = {
        public_token: app._in.token
    };

    var payload = {
        session: session,
        app_user: appUser
    };

    logger.log("users_post", payload, logger.DEBUG);

    api.request.post(users_path, params, payload, function(err, response) {
        if (err) {
            logger.error(failure_message, err, logger.USER);
        } else {
            var data = response.body;

            if (data) {
                logger.log("Taplytics::Users.post: successfully created/updated user.", response, logger.DEBUG);

                var appUserID = data.app_user_id;
                var sessionID = data.session_id;
                
                app._in.session.setAppUserID(appUserID);
                app._in.session.setSessionID(sessionID);
                app._in.session.tick();
            } else {
                logger.error(failure_message, null, logger.USER);
            }
        }

        return callback && callback(err, response);
    });
};

},{"../../config":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/config.js","../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/location":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/location.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js","../lib/source":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/source.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/app.js":[function(require,module,exports){
var Taplytics = {};


Taplytics.init = require('./functions/init')(Taplytics);
Taplytics.isReady = require('./functions/isReady')(Taplytics);
Taplytics.identify = require('./functions/identify')(Taplytics);
Taplytics.track = require('./functions/track')(Taplytics);
Taplytics.page = require('./functions/page')(Taplytics);
Taplytics.reset = require('./functions/reset')(Taplytics);

module.exports = Taplytics;

},{"./functions/identify":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/identify.js","./functions/init":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/init.js","./functions/isReady":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/isReady.js","./functions/page":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/page.js","./functions/reset":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/reset.js","./functions/track":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/track.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/identify.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
    return function(attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::identify: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }

        if (!isValidAttrs(attrs)) {
            logger.error("Taplytics::identify: you have to pass in an object with user attributes.", null, logger.USER);

            return false;
        }

        var parsedAttrs = parseAttrs(attrs);

        api.users.post(app, parsedAttrs, "Taplytics::identify: failed to save the user attributes properly.");

        return app;
    };
};

// Helpers

function isValidAttrs(attrs) {
    if (!attrs || (attrs && (typeof attrs !== "object")))
        return false;

    return true;
}

function parseAttrs(attrs) {
    var userAttrs = {
        customData: {}
    };

    var attrKeys = Object.keys(attrs);
    var attrIndex = 0;

    for (attrIndex = 0; attrIndex < attrKeys.length; attrIndex++) {
        var key = attrKeys[attrIndex];
        var value = attrs[key];
        var keyInfo = isTopLevelKey(key);

        if (keyInfo && keyInfo.isTopLevel) {
            userAttrs[keyInfo.acceptedKey] = value;
        } else {
            userAttrs.customData[key] = value;
        }
    }

    return userAttrs;
}


// Rather slow implmenetation, but it's fine since the data size is very small
function isTopLevelKey(key) {
    var accepted = {
        'user_id': ['user_id', 'id', 'userID', 'userId', 'customer_id', 'member_id'],
        'email': ['email', 'email_address'],
        'name': ['name'],
        'firstName': ['first_name', 'firstName'],
        'lastName': ['last_name', 'lastName'],
        'avatarUrl': ['avatar', 'avatarUrl'],
        'age': ['age'],
        'gender': ['gender']
    };

    var topLevelKeys = Object.keys(accepted);
    var acceptedIndex = 0;
    var acceptedKeyIndex = 0;

    for (acceptedIndex = 0; acceptedIndex < topLevelKeys.length; acceptedIndex++) {
        var topLevelKey = topLevelKeys[acceptedIndex];
        var acceptedKeys = accepted[topLevelKey];

        if (acceptedKeys) {
            for (acceptedKeyIndex = 0; acceptedKeyIndex < acceptedKeys.length; acceptedKeyIndex++) {
                var acceptedKey = acceptedKeys[acceptedKeyIndex];

                if (acceptedKey && key && acceptedKey == key)
                    return {
                        isTopLevel: true,
                        acceptedKey: acceptedKey
                    };
            }           
        }
    }


    return {
        isTopLevel: false
    };
}

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/init.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');
var location = require('../lib/location');

var auto_page_view = true;

module.exports = function(app) {
    return function(token, options) {
        if (!isValidToken(token)) {
            logger.error("Taplytics: an SDK token is required.", null, logger.USER);
            return undefined;
        }

        app.env = "production";

        if (options) {
            if (options.log_level)
                logger.setPriorityLevel(options.log_level);

            if (options.auto_page_view === false)
                auto_page_view = false;

            if (options.env)
                app.env = options.env;
        }

        /* Initialization */
        app._in = {}; // internal

        app._in.token   = token;
        app._in.session = require('../session')(app);
        app._in.logger  = logger; // In case we want to override log level ourselves


        /* Retrieve a session */
        app._in.session.start();
        api.users.post(app, {}, "Taplytics: Init failed. Taplytics will not function properly.");

        /* Track current page and other page views. */
        // location.listen(app);

        if (auto_page_view)
            app.page();
        
        return app;
    };
};

// Helper functions

function isValidToken(token) {
    if (!token)
        return false;

    if (typeof token !== "string")
        return false;

    if (!token.length)
        return false;

    return true;
}

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/location":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/location.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js","../session":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/session.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/isReady.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
    return function() {
        if (!app)
            return false;

        if (!app._in)
            return false;

        if (!app._in.token)
            return false;

        if (!app._in.session)
            return false;

        return true;
    };
};

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/page.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');
var location = require('../lib/location');

var currentView = null;

var sessionConfigOptions = {
    previous_page_href: 'p_p_l_h',
    previous_page_title: 'p_p_l_t',
    previous_page_location: 'p_p_l',
    previous_page_name: 'p_p_n',
    previous_page_category: 'p_p_c',
    previous_page_view_date: 'p_p_v_d'
};

module.exports = function(app) {
    return function(category, name, attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::track: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }
        
        var cat_name = category;
        var view_name = name;
        var attributes = attrs;
        var session = app._in.session;

        if (typeof name === 'object' && !attrs) { // for when function is used as (name, attrs)
            cat_name = undefined;
            view_name = category;
            attributes = name;
        }

        session.tick(); // tick the session

        // If we have a previous page in the session:
        // 1. Send a page close (viewDisappeared) event
        // 2. Send a time on page (viewTimeOnPage) event
        // 3. Clean up session and set the new page to the current one

        if (session.get(sessionConfigOptions.previous_page_href)) {
            var opts = getPreviousPage(session);

            api.events.pageClose(opts.category, 
                                 opts.name,
                                 opts.href,
                                 opts.title,
                                 opts.location);
            
            api.events.timeOnPage(opts.category,
                                  opts.name,
                                  opts.href,
                                  opts.title,
                                  opts.location,
                                  opts.view_date);

            unsetPreviousPage(session);
        }

        api.events.pageView(cat_name,
                            view_name,
                            attributes);

        setPreviousPage(session, cat_name, view_name);
        return app;
    };
};


// Helper functions

function getPreviousPage(session) {
    var view_date = session.get(sessionConfigOptions.previous_page_view_date);

    if (view_date)
        view_date = new Date(view_date);

    return {
        category: session.get(sessionConfigOptions.previous_page_category), 
        name: session.get(sessionConfigOptions.previous_page_name),
        href: session.get(sessionConfigOptions.previous_page_href),
        title: session.get(sessionConfigOptions.previous_page_title),
        location: session.get(sessionConfigOptions.previous_page_location, JSON && JSON.parse),
        view_date: view_date
    };
}

function setPreviousPage(session, category, name) {
    session.set(sessionConfigOptions.previous_page_category, category);
    session.set(sessionConfigOptions.previous_page_name, name);
    session.set(sessionConfigOptions.previous_page_href, location.attr('href'));
    session.set(sessionConfigOptions.previous_page_title, location.attr('title'));
    session.set(sessionConfigOptions.previous_page_location, location.toObject(), JSON && JSON.stringify);
    session.set(sessionConfigOptions.previous_page_view_date, (new Date()).toISOString());
}

function unsetPreviousPage(session) {
    session.unset(sessionConfigOptions.previous_page_category);
    session.unset(sessionConfigOptions.previous_page_name);
    session.unset(sessionConfigOptions.previous_page_href);
    session.unset(sessionConfigOptions.previous_page_title);
    session.unset(sessionConfigOptions.previous_page_location);
    session.unset(sessionConfigOptions.previous_page_view_date);
}

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/location":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/location.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/reset.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
    return function() {
        if (!app.isReady()) {
            logger.error("Taplytics::reset: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }

        var session = app._in.session;

        session.tick();

        api.users.del(app);

        session
            .deleteSessionID()
            .deleteAppUserID();

        api.users.post(app, {}, "Taplytics: couldn't create a new session/user. Taplytics will not function properly.");

        return app;
    };
};

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/functions/track.js":[function(require,module,exports){
var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
    return function(event_name, value, attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::track: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }

        if (!event_name) {
            logger.error("Taplytics::track: you have to specify an event name.", null, logger.USER);
            return false;
        }

        var val = value;
        var attributes = attrs;

        if (typeof value === 'object' && !attrs) { // for when function is used as (event_name, attrs)
            val = undefined;
            attributes = value;
        }
        
  
        app._in.session.tick(); // tick the session

        api.events.goalAchieved(event_name, val, attributes);

        return app;
    };
};

},{"../api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","../lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/index.js":[function(require,module,exports){
var api = require('./api');
var app = require('./app');

window.Taplytics = module.exports = app;

// Launch functions from the queue if there's one.
// This queue is created by the async loader.

if (window._TLQueue && window._TLQueue instanceof Array) {
    var queue = window._TLQueue;

    if (queue.length > 0) {
        for(var i = 0; i < queue.length; i++) {
            var func = queue[i];

            var func_name = func.shift();
            var func_args = func;

            if (app[func_name] instanceof Function)
                app[func_name].apply(app, func_args);
        }
    }

}
},{"./api":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/api.js","./app":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/app.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/location.js":[function(require,module,exports){
var swizzle = require('../lib/swizzle');
var logger = require('./logger');

var override = {};

exports.toObject = function() {
    return {
        href: locationAttribute('href'),
        hash: locationAttribute('hash'),
        search: locationAttribute('search'),
        host: locationAttribute('host'),
        protocol: locationAttribute('protocol'),
        pathname: locationAttribute('pathname'),
        title: locationAttribute('title')
    };
};

exports.attr = function(key) {
    return locationAttribute(key);
};

exports.listen = function(app) {
    
    // TODO: pushState / onpopstate / onhashchange
    // if (window.history) {
    //     logger.log("Taplytics: Listening on history changes to track sessions.", null, logger.LOG);

    //     window.addEventListener('popstate', onpopstate);

    //     if (window.history.pushState) {
    //         swizzle(window.history, 'pushState', onpushstate, window.history);
    //         swizzle(window.history, 'replaceState', onreplacestate, window.history);
    //     } else
    //         window.addEventListener('hashchange', onhashchange);
    // }
};


function locationAttribute(attr) {
    if (override[attr])
        return override[attr];

    if (attr === 'title')
        return document.title;
    
    if (document.location)
        return document.location[attr];
    else return null;
};

// function onpopstate(e) {
//  // exports.toObject will work just fine here.

//     logger.log("onpopstate:", e, logger.DEBUG);
//     logger.log("location:", exports.toObject(), logger.DEBUG);
// }

// function onpushstate(stateObj, title, state) {
//  // exports.toObject won't work as pushState doesn't change document.location

//     logger.log("onpushstate:", state, logger.DEBUG);
//     logger.log("location", exports.toObject(), logger.DEBUG);
// }

// function onreplacestate(stateObj, title, state) {
//     logger.log("onreplacestate:", state, logger.DEBUG);
//     logger.log("location", exports.toObject(), logger.DEBUG);    
// }

// function onhashchange(e) {
//  logger.log("onhashchange:", e, logger.DEBUG);
//     logger.log("location:", exports.toObject(), logger.DEBUG);
// }
},{"../lib/swizzle":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/swizzle.js","./logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js":[function(require,module,exports){
var priority_level = 0; // 2: debug, 1: log, 0: quiet (big error only)

function isLoggerEnabled(level) {
    return priority_level >= level;
}

module.exports = {
    DEBUG: 2,
    LOG: 1,
    USER: 0,
    setPriorityLevel: function(priority) {
        priority_level = priority;
    },
    log: function(desc, obj, level) {
        if (level !== undefined && !isLoggerEnabled(level))
            return;
        
        console.log(desc);
        
        if (obj)
            console.dir(obj);
    },
    error: function(desc, err, level) {
        if (level !== undefined && !isLoggerEnabled(level))
            return;

        console.error(desc);
        
        if (err)
            console.dir(err);
    }
};
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/merge.js":[function(require,module,exports){

module.exports = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    
    return destination;
};
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/queue.js":[function(require,module,exports){
function Queue() {

    var queue  = [];

    this.length = function() {
        return queue.length
    };

    this.isEmpty = function() {
        return (queue.length === 0);
    };

    this.enqueue = function(item) {
        queue.push(item);
    };

    this.enqueueAll = function(items) {
        if (!items || (items && typeof items !== "array"))
            return 0;

        var index = 0;

        for (index = 0; index < items.length; index++) {
            var item = items[index];

            this.enqueue(item);
        }

        return items.length;
    };

    this.dequeue = function() {
        if (queue.length == 0) return undefined;

        var item = queue.shift();

        return item;
    };

    this.flush = function() {
        var oldQueue = queue.slice();

        queue = [];

        return oldQueue;
    };

    this.peek = function() {
        return (queue.length > 0 ? queue[0] : undefined);
    };
}


module.exports = Queue;
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/source.js":[function(require,module,exports){
var Qs = require('qs');

module.exports = function() {
	var searchParams = {};
	var referrer = null;

	if (location && location.search && location.search.length)
		 searchParams = Qs.parse(location.search.substr(1));

	if (document && document.referrer)
		referrer = document.referrer;

	var source = {
		referrer: referrer,
		search: searchParams
	};

	return source;
};
},{"qs":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/index.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/swizzle.js":[function(require,module,exports){
module.exports = function(object, func, new_func, context) {
    // Make sure new_func is called before (with `context`) object[func] and make sure to call object[func] with `context`

    if (!object)
        return false;

    if (!func || typeof func !== "string")
        return false;

    if (!new_func || typeof new_func !== "function")
        return false;

    if (!object[func])
        return false;

    var originalFunc = object[func];

    (function(cntx) {
        object[func] = function() {
            new_func.apply(cntx, arguments);
            originalFunc.apply(cntx, arguments); 
        };
    })(context);

    return true;
};
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/session.js":[function(require,module,exports){
var logger = require('./lib/logger');

var Cookies = require('cookies-js');
var uuidGenerator = require('uuid');

// Cookies.defaults = {
//     secure: true
// };

module.exports = function(app) {
    if (!app || (app && !app._in.token)) return undefined;

    var cookieConfig = {
        cookieSessionID: '_tl_csid_' + app.token,
        sessionUUID: '_tl_suuid_' + app.token,

        // Correspond to models on our system:
        sessionID: '_tl_sid_' + app.token,
        appUserID: '_tl_auid_' + app.token,
        sessionOptions: function(sessionID, key) {
            if (!sessionID || !key)
                return null;

            return 'tl_sopts_' + app.token + '_' + sessionID + '_' + key;
        }
    };

    var Session = {};

    Session.start = function() {
        Session
            .updateCookieSession()
            .setSessionUUID();

        return Session;
    };

    Session.tick = function() {
        Session.updateCookieSession(); // Make sure we reset the expiration

        return Session;
    };

    // Sets a session variable (only accessible during this session)

    Session.get = function(key, is_json) {
        if (!key)
            return undefined;

        Session.tick();

        var sessionID = Session.getCookieSessionID();
        var cookieKey = cookieConfig.sessionOptions(sessionID, key);

        if (!cookieKey)
            return undefined;
        
        if (!is_json || !(JSON && JSON.parse))
            return Cookies.get(cookieKey);
        else
            return JSON.parse(Cookies.get(cookieKey));
    };

    Session.set = function(key, value, is_json) {
        if (!key || value === undefined)
            return false;

        Session.tick();

        var sessionID = Session.getCookieSessionID();
        var cookieKey = cookieConfig.sessionOptions(sessionID, key);
        var expirationDate = dateAdd(new Date(), 'minute', 30); // 30 minute expiration
        var clean_value = value;

        if (!cookieKey)
            return false;

        if (is_json && JSON && JSON.stringify)
            clean_value = JSON.stringify(value);

        Cookies.set(cookieKey, clean_value, {
            expires: expirationDate
        });

        return true;
    };

    // Unsets a session variable
    Session.unset = function(key) {
        if (!key)
            return false;

        Session.tick();

        var sessionID = Session.getCookieSessionID();
        var cookieKey = cookieConfig.sessionOptions(sessionID, key);

        Cookies.expire(cookieKey);
    };


    // Setters

    Session.updateCookieSession = function() {
        var cookieSessionID = Session.getCookieSessionID();

        if (!cookieSessionID) { // We've expired!
            cookieSessionID = uuidGenerator.v4();
            Session.deleteSessionID();
        }

        var expirationDate = dateAdd(new Date(), 'minute', 30); // 30 minute expiration

        Cookies.set(cookieConfig.cookieSessionID, cookieSessionID, {
          expires: expirationDate
        });

        logger.log("Set cookieSessionID to: " + cookieSessionID, {
            expires: expirationDate
        }, logger.DEBUG);

        return Session;
    };

    Session.setSessionUUID = function() {
        var sessionUUID = Session.getSessionUUID();
        if (!sessionUUID)
            sessionUUID = uuidGenerator.v4();

        Cookies.set(cookieConfig.sessionUUID, sessionUUID);

        logger.log("Set sessionUUID to: " + sessionUUID, null, logger.DEBUG);

        return Session;
    };

    Session.deleteSessionID = function() {
        Cookies.expire(cookieConfig.sessionID);

        return Session;
    };

    Session.deleteAppUserID = function() {
        Cookies.expire(cookieConfig.appUserID);

        return Session;
    };

    Session.setSessionID = function(sessionID) {
        Cookies.set(cookieConfig.sessionID, sessionID);

        logger.log("Set sessionID to: " + sessionID, null, logger.DEBUG);

        return Session;
    };

    Session.setAppUserID = function(appUserID) {
        Cookies.set(cookieConfig.appUserID, appUserID);

        logger.log("Set appUserID to: " + appUserID, null, logger.DEBUG);

        return Session;
    };

    // Getters

    Session.getSessionUUID = function() {
        return Cookies.get(cookieConfig.sessionUUID);
    };

    Session.getCookieSessionID = function() {
        return Cookies.get(cookieConfig.cookieSessionID);
    };

    Session.getAppUserID = function() {
        return Cookies.get(cookieConfig.appUserID);
    };

    Session.getSessionID = function() {
        return Cookies.get(cookieConfig.sessionID);
    };

    return Session;
};


// Helper Functions

function dateAdd(date, interval, units) { // Thank you SO: http://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
  var ret = new Date(date); //don't change original date
  switch(interval.toLowerCase()) {
    case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
    case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
    default       :  ret = undefined;  break;
  }
  return ret;
}

},{"./lib/logger":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/lib/logger.js","cookies-js":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/cookies-js/dist/cookies.js","uuid":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/uuid/uuid.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/config.js":[function(require,module,exports){
var app = require('./app/app');

exports.obj = function() {
    var config = {};

    if (app.env !== 'production')
        config.baseAPI = "http://localhost:3002/public_api/v1/";
    else if (app.env === 'dev' || app.env === 'development')
        config.baseAPI = "https://dev.taplytics.com/public_api/v1/";
    else
        config.baseAPI = "https://taplytics.com/public_api/v1/";

    config.eventsFlushQueueTimeout = 4000;

    return config;
};


exports.isProduction = function() {
    return (app.env === 'production');
};

},{"./app/app":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/app.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/cookies-js/dist/cookies.js":[function(require,module,exports){
/*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }

            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/index.js":[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/index.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/index.js":[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/parse.js","./stringify":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/stringify.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/parse.js":[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000
};


internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (Object.prototype.hasOwnProperty(key)) {
                continue;
            }

            if (!obj.hasOwnProperty(key)) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};


internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj = {};
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    }
    else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        var indexString = '' + index;
        if (!isNaN(index) &&
            root !== cleanRoot &&
            indexString === cleanRoot &&
            index >= 0 &&
            index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        }
        else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};


internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Don't allow them to overwrite object prototype properties

    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};


module.exports = function (str, options) {

    if (str === '' ||
        str === null ||
        typeof str === 'undefined') {

        return {};
    }

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj);
    }

    return Utils.compact(obj);
};

},{"./utils":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/utils.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/stringify.js":[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    arrayPrefixGenerators: {
        brackets: function (prefix, key) {
            return prefix + '[]';
        },
        indices: function (prefix, key) {
            return prefix + '[' + key + ']';
        },
        repeat: function (prefix, key) {
            return prefix;
        }
    }
};


internals.stringify = function (obj, prefix, generateArrayPrefix) {

    if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        if (Array.isArray(obj)) {
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
        }
        else {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

    var keys = [];

    if (typeof obj !== 'object' ||
        obj === null) {

        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    }
    else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix));
    }

    return keys.join(delimiter);
};

},{"./utils":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/utils.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/qs/lib/utils.js":[function(require,module,exports){
// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        }
        else {
            target[source] = true;
        }

        return target;
    }

    if (typeof target !== 'object') {
        target = [target].concat(source);
        return target;
    }

    if (Array.isArray(target) &&
        !Array.isArray(source)) {

        target = exports.arrayToObject(target);
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (!target[key]) {
            target[key] = value;
        }
        else {
            target[key] = exports.merge(target[key], value);
        }
    }

    return target;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj, refs) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, il = obj.length; i < il; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};


exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};


exports.isBuffer = function (obj) {

    if (obj === null ||
        typeof obj === 'undefined') {

        return false;
    }

    return !!(obj.constructor &&
        obj.constructor.isBuffer &&
        obj.constructor.isBuffer(obj));
};

},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/lib/client.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(err || new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = function(e){
        e.percent = e.loaded / e.total * 100;
        self.emit('progress', e);
      };
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/node_modules/component-emitter/index.js","reduce":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/node_modules/reduce-component/index.js"}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/node_modules/component-emitter/index.js":[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/superagent/node_modules/reduce-component/index.js":[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/uuid/rng-browser.js":[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/uuid/uuid.js":[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":"/Users/matthewkuzyk/Code/Repo/Taplytics-JS/node_modules/uuid/rng-browser.js"}]},{},["/Users/matthewkuzyk/Code/Repo/Taplytics-JS/app/index.js"]);
