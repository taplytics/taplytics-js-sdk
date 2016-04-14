var Cookies = require('./cookies');
var uuidGenerator = require('uuid');
var log = require('./logger');
var config = require('../../config');
var source = require('../lib/source');
var location = require('../lib/location');

var cookieConfig = {
    cookieSessionID: '_tl_csid',
    sessionUUID: '_tl_suuid',
    // Correspond to models on our system:
    sessionID: '_tl_sid',
    appUserID: '_tl_auid',
    sessionOptions: function (sessionID, key) {
        if (!sessionID || !key)
            return null;

        return 'tl_sopts_' + sessionID + '_' + key;
    }
};

// Session Data
exports.data = {};
// if the session has loaded data from our servers
exports.hasLoadedData = false;

//
// Lifecycle methods
//
exports.start = function () {
    exports.updateCookieSession()
        .setSessionUUID();

    return exports;
};

// Sets a session variable (only accessible during this session)
exports.get = function (key, is_json) {
    if (!key)
        return undefined;

    exports.tick();

    var sessionID = exports.getCookieSessionID();
    var cookieKey = cookieConfig.sessionOptions(sessionID, key);
    if (!cookieKey)
        return undefined;

    if (!is_json || !(JSON && JSON.parse)) {
        return Cookies.get(cookieKey);
    }
    else {
        var val = Cookies.get(cookieKey);

        try {
            return JSON.parse(val);
        } catch (err) {
            log.error("Session.get(" + key + ") failed to parse JSON.", err, log.DEBUG);
            return val;
        }
    }
};

exports.tick = function () {
    exports.updateCookieSession(); // Make sure we reset the expiration
    return exports;
};

exports.set = function (key, value, is_json) {
    if (!key || value === undefined || (("" + value).length === 0))
        return false;

    exports.tick();

    var sessionID = exports.getCookieSessionID();
    var cookieKey = cookieConfig.sessionOptions(sessionID, key);
    var expirationDate = dateAdd(new Date(), 'minute', 30); // 30 minute expiration
    var clean_value = value;
    if (!cookieKey)
        return false;

    if (is_json && JSON && JSON.stringify)
        clean_value = JSON.stringify(value);

    Cookies.set(cookieKey, clean_value, {expires: expirationDate});

    return true;
};

// Unsets a session variable
exports.unset = function(key) {
    if (!key) return false;

    exports.tick();

    var sessionID = exports.getCookieSessionID();
    var cookieKey = cookieConfig.sessionOptions(sessionID, key);

    Cookies.expire(cookieKey);
};

//
// Setters
//
exports.updateCookieSession = function() {
    var cookieSessionID = exports.getCookieSessionID();
    if (!cookieSessionID) { // We've expired!
        cookieSessionID = uuidGenerator.v4();
        exports.deleteSessionID();
    }

    var expirationDate = dateAdd(new Date(), 'minute', 30); // 30 minute expiration

    Cookies.set(cookieConfig.cookieSessionID, cookieSessionID, {expires: expirationDate});
    log.log("Set cookieSessionID to: " + cookieSessionID, {expires: expirationDate}, log.DEBUG);

    return exports;
};

exports.setSessionUUID = function() {
    var sessionUUID = exports.getSessionUUID();
    if (!sessionUUID)
        sessionUUID = uuidGenerator.v4();

    Cookies.set(cookieConfig.sessionUUID, sessionUUID);
    log.log("Set sessionUUID to: " + sessionUUID, null, log.DEBUG);

    return exports;
};

exports.deleteSessionID = function() {
    Cookies.expire(cookieConfig.sessionID);
    return exports;
};

exports.deleteAppUserID = function() {
    Cookies.expire(cookieConfig.appUserID);
    return exports;
};

exports.setSessionID = function(sessionID) {
    Cookies.set(cookieConfig.sessionID, sessionID);
    log.log("Set sessionID to: " + sessionID, null, log.DEBUG);
    return exports;
};

exports.setAppUserID = function(appUserID) {
    Cookies.set(cookieConfig.appUserID, appUserID);
    log.log("Set appUserID to: " + appUserID, null, log.DEBUG);
    return exports;
};

//
// Getters
//
exports.getSessionUUID = function() {
    return Cookies.get(cookieConfig.sessionUUID);
};

exports.getCookieSessionID = function() {
    return Cookies.get(cookieConfig.cookieSessionID);
};

exports.getAppUserID = function() {
    return Cookies.get(cookieConfig.appUserID);
};

exports.getSessionID = function() {
    return Cookies.get(cookieConfig.sessionID);
};

//
// Session Attributes
//
exports.getSessionAttributes = function(attr) {
  attr = (attr || {});
  var locationData = location.toObject(); // document.location
  var sourceData = source(); // document.referrer + location.search

  attr.sid = this.getSessionID();
  attr.ad  = this.getSessionUUID();
  attr.adt = 'browser';
  attr.ct  = 'browser';
  attr.lv  = config.isProduction() ? '0' : '1';
  attr.sdk = config.sdkVersion;
  attr.rfr = sourceData.referrer;

  attr.exm = sourceData.search.utm_medium;
  attr.exs = sourceData.search.utm_source;
  attr.exc = sourceData.search.utm_campaign;
  attr.ext = sourceData.search.utm_term;
  attr.exct = sourceData.search.utm_content;

  attr.prms = {
      search: sourceData.search,
      location: locationData
  };

  if (navigator && navigator.userAgent)
      attr.prms.userAgent = navigator.userAgent;

  return attr;
};

exports.saveSessionConfig = function(config) {
    exports.config = config;
    if (config) {
        exports.hasLoadedData = true;
        exports.setAppUserID(config.app_user_id);
        exports.setSessionID(config.session_id);
        exports.tick();
    }

    // call all session data promises, even if config doesn't load
    var i = 0;
    for (var i = 0; i < exports.sessionConfigPromises.length; i++) {
        var promise = exports.sessionConfigPromises[i];
        if (promise) promise();
    }
    exports.sessionConfigPromises = [];
};

exports.sessionConfigPromises = [];
exports.sessionConfigPromise = function(callback) {
    if (!callback) return;
    if (exports.hasLoadedData && exports.data)
        return callback();
    else
        exports.sessionConfigPromises.push(callback);
};

exports.resetSession = function() {
    exports.deleteSessionID();
    exports.deleteAppUserID();
    exports.data = null;
    exports.hasLoadedData = false;
};

//
// Helper Functions
//
function dateAdd(date, interval, units) { // Thank you SO: http://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
    var ret = new Date(date); //don't change original date
    switch (interval.toLowerCase()) {
        case 'year'   :
            ret.setFullYear(ret.getFullYear() + units);
            break;
        case 'quarter':
            ret.setMonth(ret.getMonth() + 3 * units);
            break;
        case 'month'  :
            ret.setMonth(ret.getMonth() + units);
            break;
        case 'week'   :
            ret.setDate(ret.getDate() + 7 * units);
            break;
        case 'day'    :
            ret.setDate(ret.getDate() + units);
            break;
        case 'hour'   :
            ret.setTime(ret.getTime() + units * 3600000);
            break;
        case 'minute' :
            ret.setTime(ret.getTime() + units * 60000);
            break;
        case 'second' :
            ret.setTime(ret.getTime() + units * 1000);
            break;
        default       :
            ret = undefined;
            break;
    }
    return ret;
}
