var session = require('../lib/session');

// return running experiments and variations when session data is loaded
module.exports = function(callback) {
    session.configPromise(function() {
        var expVars = (session.config && session.config.expVarsNames ? session.config.expVarsNames : {});
        return callback && callback(expVars);
    });
};
