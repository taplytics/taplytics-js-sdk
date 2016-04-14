exports.request = require('./api/base');
exports.users = require('./api/users');
exports.events = require('./api/events');
exports.config = require('./api/config');

exports.init = function(app) {
    if (app && app._in && app._in.token)
        return true && this.request.setPublicToken(app._in.token);
    else
        return false;
};
