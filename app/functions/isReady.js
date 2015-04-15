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
