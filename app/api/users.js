var location = require('../lib/location');
var source = require('../lib/source');
var logger = require('../lib/logger');
var api = require('../api');
var session = require('../lib/session');
var config = require('../../config');

exports.users_path = 'users';

// Requests

exports.del = function(app, callback) {
    var appUserID = session.getAppUserID();

    if (!appUserID)
        return;

    var sessionAttrs = {};

    sessionAttrs.sid = session.getSessionID();
    sessionAttrs.ad  = session.getSessionUUID();

    var params = {
        public_token: app._in.token
    };

    var payload = {
        session: sessionAttrs
    };

    logger.log("users_del", payload, logger.DEBUG);

    api.request.del(exports.users_path + "/" + appUserID, params, payload, function(err, response) {
        if (err)
            logger.error("Taplytics: Couldn't properly rest user.", response, logger.DEBUG);
        else
            logger.log("Taplytics: successfully reset the user.", response, logger.DEBUG);

        return callback && callback(err, response);
    });
};

exports.post = function(app, user_attrs, failure_message, callback) {
    var locationData = location.toObject(); // document.location
    var sourceData = source(); // document.referrer + location.search
    var appUser = user_attrs;
    var sessionAttrs = {};

    if (!appUser)
        appUser = {};

    sessionAttrs.sid = session.getSessionID();
    sessionAttrs.ad  = session.getSessionUUID();
    sessionAttrs.adt = 'browser';
    sessionAttrs.ct  = 'browser';
    sessionAttrs.lv  = config.isProduction() ? '0' : '1';
    sessionAttrs.rfr = sourceData.referrer;

    sessionAttrs.exm = sourceData.search.utm_medium;
    sessionAttrs.exs = sourceData.search.utm_source;
    sessionAttrs.exc = sourceData.search.utm_campaign;
    sessionAttrs.ext = sourceData.search.utm_term;
    sessionAttrs.exct = sourceData.search.utm_content;

    sessionAttrs.prms = {
        search: sourceData.search,
        location: locationData
    };

    if (navigator && navigator.userAgent)
        sessionAttrs.prms.userAgent = navigator.userAgent;

    appUser.auid = session.getAppUserID();

    var params = {
        public_token: app._in.token
    };

    var payload = {
        session: sessionAttrs,
        app_user: appUser
    };

    logger.log("users_post", payload, logger.DEBUG);

    api.request.post(exports.users_path, params, payload, function(err, response) {
        if (err) {
            logger.error(failure_message, err, logger.USER);
        } else {
            var data = response.body;

            if (data) {
                logger.log("Taplytics::Users.post: successfully created/updated user.", response, logger.DEBUG);

                var appUserID = data.app_user_id;
                var sessionID = data.session_id;

                session.setAppUserID(appUserID);
                session.setSessionID(sessionID);
                session.tick();
            } else {
                logger.error(failure_message, null, logger.USER);
            }
        }
        return callback && callback(err, response);
    });
};
