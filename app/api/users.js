var request = require('./base');
var source = require('../lib/source');
var log = require('../lib/logger');
var session = require('../lib/session');

exports.users_path = 'users';

//
// Requests
//
exports.del = function(next) {
    session.sessionConfigPromise(function() {
        var appUserID = session.getAppUserID();
        if (!appUserID)
            return;

        var sessionAttrs = {};
        sessionAttrs.sid = session.getSessionID();
        sessionAttrs.ad  = session.getSessionUUID();

        var params = {};
        var body = {
            session: sessionAttrs
        };

        log.log("users_del", body, log.DEBUG);

        request.del(exports.users_path + "/" + appUserID, params, body, function(err, response) {
            if (err)
                log.error("Couldn't properly rest user.", response, log.DEBUG);
            else
                log.log("Successfully reset the user.", response, log.DEBUG);

            return next && next(err, response);
        });
    });
};

exports.post = function(user_attrs, failure_message, next) {
    session.sessionConfigPromise(function() {
        var appUser = user_attrs;
        var sessionAttrs = session.getSessionAttributes();
        if (!appUser) appUser = {};
        appUser.auid = session.getAppUserID();

        var body = {
            session: sessionAttrs,
            app_user: appUser
        };

        log.log("users_post", body, log.DEBUG);

        request.post(exports.users_path, {}, body, function(err, response) {
            if (err) {
                log.error(failure_message, err, log.USER);
            }
            else {
                var data = response.body;
                if (data) {
                    log.log("Users.post: successfully created/updated user.", response, log.DEBUG);
                    session.setAppUserID(data.app_user_id);
                    session.setSessionID(data.session_id);
                    session.tick();
                } else {
                    log.error(failure_message, null, log.USER);
                }
            }
            return next && next(err, response);
        });
    });
};
