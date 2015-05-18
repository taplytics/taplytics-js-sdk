var logger = require('../lib/logger');
var api = require('../api');

module.exports = function() {
    if (!this._in)
        return false;

    if (!this._in.token)
        return false;
    
    return true;
};
