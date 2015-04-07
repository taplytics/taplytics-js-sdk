var logger = require('./lib/logger');

var Cookies = require('cookies-js');
var uuidGenerator = require('uuid');

Cookies.defaults = {
    secure: true
};

module.exports = function(token) {
    if (!token) return null;

    var cookieConfig = {
        sessionID: '_tl_sid_' + token
    };


    var Session = {};

    Session.start = function() {
        var sessionID = Session.getSessionID();

        if (!sessionID)
            Session.updateSession();

        return Session;
    };

    Session.getSessionID = function() {
        return Cookies.get(cookieConfig.sessionID);
    };

    Session.updateSession = function() {
        var sessionID = Session.getSessionID() || uuidGenerator.v4();

        // logger.log("Setting Session", {
        //  cookieConfig: cookieConfig.sessionID,
        //  sessionID: sessionID
        // });

        Cookies.set(cookieConfig.sessionID, sessionID);

        return Session;
    };

    return Session;
};