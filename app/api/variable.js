var request = require('./base');
var log = require('../lib/logger');
var session = require('../lib/session');

exports.post = function(variable, next) {
    if (!variable) return log.error("No new variable to post to server", null, log.DEBUG);

    var body = {
        name: variable.name,
        createdAt: new Date(),
        variableType: variable.defaultType,
        defaultVal: variable.defaultValue
    };

    log.log("variable_post", body, log.DEBUG);
    request.post("variable", {}, body, function(err, response) {
        if (err) {
            log.error("Failed to post variable", err, log.DEBUG);
        }
        else {
            var newVariable = response.body;
            if (newVariable && newVariable.name) {
                log.log("Users.post: successfully created new variable.", newVariable, log.DEBUG);
            }
        }
        return next && next(err);
    });
};
