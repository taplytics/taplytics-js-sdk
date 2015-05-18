jest.dontMock('../isReady');

describe("Taplytics.isReady - uninitialized app", function() {
    it("should return false if app is not initialized", function() {
        var TaplyticsUninitialized = require('../../../test/helpers/uninitialized_app');

        expect(!TaplyticsUninitialized.isReady());
    });
});

describe("Taplytics.isReady - initialized app", function() {
    it("should return true if app is initialized", function() {
        var Taplytics = require('../../../test/helpers/initialized_app');

        expect(Taplytics.isReady());
    });
});
