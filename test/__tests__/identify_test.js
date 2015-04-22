jest.autoMockOff();
var should = require.requireActual('should');
var Taplytics = require('../helpers/initialized_app');
Taplytics.identify = require.requireActual('../../app/functions/identify')(Taplytics);

describe("Identifying", function() {
    it("should error on invalid attributes", function() {
        var attrs = "fake";
        Taplytics.identify(attrs).should.be.equal(false);
    });
});
