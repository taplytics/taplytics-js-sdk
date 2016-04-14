var session = require('../lib/session');

// return running experiments and variations when session data is loaded
module.exports = function(callback) {
    session.sessionConfigPromise(callback);
};
