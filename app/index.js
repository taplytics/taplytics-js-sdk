var api = require('./api');
var app = require('./app');

window.Taplytics = module.exports = app;

// Launch functions from the queue if there's one.
// This queue is created by the async loader.

if (window._TLQueue && window._TLQueue instanceof Array) {
    var queue = window._TLQueue;

    if (queue.length > 0) {
        for(var i = 0; i < queue.length; i++) {
            var func = queue[i];

            var func_name = func.shift();
            var func_args = func;

            if (app[func_name] instanceof Function)
                app[func_name].apply(app, func_args);
        }
    }

}