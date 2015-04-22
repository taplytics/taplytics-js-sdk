module.exports = function() {
    var Taplytics = {};
    Taplytics.init = require('../functions/init')(Taplytics);
    Taplytics.isReady = require('../functions/isReady')(Taplytics);
    Taplytics.isMock = true;
    return Taplytics;
}();




