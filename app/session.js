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
            if (!sessionID || key)
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

    Session.get = function(key) {
        if (!key)
            return undefined;

        Session.tick();

        var sessionID = Session.getCookieSessionID();
        var cookieKey = cookieConfig.sessionOptions(sessionID, key);
        
        return Cookies.get(cookieKey);
    };

    Session.set = function(key, value) {
        if (!key)
            return false;

        Session.tick();

        var sessionID = Session.getCookieSessionID();
        var cookieKey = cookieConfig.sessionOptions(sessionID, key);
        var expirationDate = dateAdd(new Date(), 'minute', 30); // 30 minute expiration

        Cookies.set(cookieKey, value, {
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