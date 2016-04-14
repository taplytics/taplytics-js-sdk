var request = require('./base');
var log = require('../lib/logger');
var session = require('../lib/session');

// switch to get
exports.get = function(next) {
    var sessionAttrs = session.getSessionAttributes();
    sessionAttrs.auid = session.getAppUserID();
    if (sessionAttrs.prms) sessionAttrs.prms = JSON.stringify(sessionAttrs.prms);

    log.log("config_get", sessionAttrs, log.DEBUG);
    request.get("config", sessionAttrs, function(err, response) {
        if (err) {
            log.error("Failed to get config", err, log.DEBUG);
            session.saveSessionConfig(null);
        }
        else {
            var data = response.body;
            session.saveSessionConfig(data);
            if (data) {
                log.log("config.get: successfully got session config data", response, log.DEBUG);
            } else {
                log.error("No config data in response", null, log.DEBUG);
            }
        }
        return next && next(err, response);
    });
};
