var Taplytics = {};


Taplytics.init = require('./functions/init')(Taplytics);
Taplytics.isReady = require('./functions/isReady')(Taplytics);
Taplytics.identify = require('./functions/identify')(Taplytics);
Taplytics.track = require('./functions/track')(Taplytics);
Taplytics.page = require('./functions/page')(Taplytics);
Taplytics.reset = require('./functions/reset')(Taplytics);

module.exports = Taplytics;
