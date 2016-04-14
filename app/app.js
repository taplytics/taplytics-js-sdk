var Taplytics = {};

Taplytics.api = require('./api');
Taplytics.init = require('./functions/init');
Taplytics.isReady = require('./functions/isReady');
Taplytics.identify = require('./functions/identify');
Taplytics.track = require('./functions/track');
Taplytics.page = require('./functions/page');
Taplytics.reset = require('./functions/reset');
Taplytics.propertiesLoaded = require('./functions/propertiesLoaded');
Taplytics.runningExperiments = require('./functions/runningExperiments');
Taplytics.variable = require('./functions/variable');
Taplytics.codeBlock = require('./functions/codeBlock');

module.exports = Taplytics;
