var app = require('./app');
var logger = require('./lib/logger');
var config = require('../config');

exports.Taplytics = window.Taplytics = module.exports = app;

// Launch functions from the app queue if there is one.
// This queue is filled by the async loader and users.
exports.flushAppQueue = function() {
    logger.log("flushAppQueue tick", window._tlq, logger.LOUD);

    if (window._tlq && window._tlq instanceof Array) {
        var queue = window._tlq.slice();

        // Empty queue
        window._tlq = [];

        // Sort by init < identify if sort is supported.
        if (Array.prototype.sort) {
            queue.sort(function(a, b) {
                if (a instanceof Array && b instanceof Array) {
                    if (a[0] === 'init' && b[0] === 'identify')
                        return -1;
                    else if (a[0] === 'identify' && b[0] === 'init')
                        return 1;
                    else if (a[0] === 'init' || a[0] == 'identify')
                        return -1;
                }
                return 2;
            });
        }

        if (queue.length > 0) {
            logger.log("flushAppQueue: " + queue.length, queue, logger.LOUD);

            for(var i = 0; i < queue.length; i++) {
                var func = queue[i];

                var func_name = func.shift();
                var func_args = func;

                if (app[func_name] && app[func_name] instanceof Function) {
                    try {
                        app[func_name].apply(app, func_args);
                    } catch (e) {
                        logger.error("Attempted to call " + 
                                     func_name + "(" + (func_args || []).join(',') + 
                                     "); from the queue but failed!", e, logger.USER);
                        if (e && e.stack)
                            logger.error(e.stack, null, logger.DEBUG);
                    }
                }
            }
        }
    }

    // Keep emptying the queue in case users are using it over time
    setTimeout(exports.flushAppQueue, config.obj().functionFlushQueueTimeout);
};

exports.flushAppQueue();
