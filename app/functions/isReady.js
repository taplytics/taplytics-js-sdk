var api = require('../api');

module.exports = function() {
    return !(!this._in || !this._in.token);
};
