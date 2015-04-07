var Taplytics = {};


Taplytics.init = require('./functions/init')(Taplytics);
Taplytics.identify = require('./functions/identify')(Taplytics);

module.exports = Taplytics;