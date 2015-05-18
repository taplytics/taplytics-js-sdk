var Taplytics = {};


Taplytics.api = require('./api');
Taplytics.init = require('./functions/init');
Taplytics.isReady = require('./functions/isReady');
Taplytics.identify = require('./functions/identify');
Taplytics.track = require('./functions/track');
Taplytics.page = require('./functions/page');
Taplytics.reset = require('./functions/reset');

module.exports = Taplytics;
