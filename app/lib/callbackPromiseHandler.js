var log = require('../lib/logger');
var request = require('../api/base');

// This class holds callback promises and ensures that they will get called
// before the request.timeout time.
function CallbackPromiseHandler(opts) {
    this.promises = [];
    this.name = opts ? opts.name : null;
}

CallbackPromiseHandler.prototype.push = function(callback) {
    var hasExecutedCallback = false;
    var self = this;

    function executeCallback(value) {
        if (hasExecutedCallback) return;

        if (callback) {
            hasExecutedCallback = true;
            callback(value);
        }
    }

    this.promises.push(executeCallback);

    setTimeout(function() {
        if (!hasExecutedCallback) {
            log.log(self.name + " promise timed out", null, log.LOG);
            executeCallback();
        }
    }, request.timeout);
}

CallbackPromiseHandler.prototype.completePromises = function(value) {
    for (var i=0; i < this.promises.length; i++) {
        var promise = this.promises[i];
        if (promise) promise(value);
    }
    this.promises = [];
}

module.exports = CallbackPromiseHandler;
