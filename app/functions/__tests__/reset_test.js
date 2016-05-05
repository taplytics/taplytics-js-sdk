jest.dontMock('../reset');

describe("Taplytics.reset - uninitialized app", function() {
    it("should error on if app is not initialized", function() {
        var TaplyticsUninitialized = require('../../../test/helpers/uninitialized_app');
        var logger = require('../../lib/logger');

        TaplyticsUninitialized.reset();

        expect(logger.error).toBeCalled();
    });
});

describe("Taplytics.reset - session", function() {
    it("should delete session ID and app user ID", function() {
        var Taplytics = require('../../../test/helpers/initialized_app');
        var session = require('../../lib/session');

        Taplytics.reset();

        expect(session.deleteSessionID).toBeCalled();
        expect(session.deleteAppUserID).toBeCalled();
    });
});

describe("Taplytics.reset - server call", function() {
    var Taplytics;
    var api;

    beforeEach(function() {
        Taplytics = require('../../../test/helpers/initialized_app');
        api = require('../../api');
    });


    it("should delete the user", function() {
        Taplytics.reset();

        expect(api.users.del).toBeCalled();
    });

    it("should create new user", function() {
        var callCount = api.users.post.mock.calls.length;

        Taplytics.reset();

        expect(api.users.post.mock.calls.length > callCount);
    });
});
