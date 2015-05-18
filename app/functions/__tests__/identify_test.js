jest.dontMock('../identify');

describe("Taplytics.identify - uninitialized app", function() {
    var TaplyticsUninitialized;
    var logger;

    beforeEach(function() {
        TaplyticsUninitialized = require('../../../test/helpers/uninitialized_app');
        logger = require('../../lib/logger'); // mocked        
    });

    it("should error on uninitialized SDK", function() {
        var attrs = {
            valid: "attrs"
        };

        TaplyticsUninitialized.identify(attrs);
        expect(logger.error).toBeCalled();
    });
});

describe("Taplytics.identify - arguments", function() {
    var Taplytics;
    var logger;

    beforeEach(function() {
        Taplytics = require('../../../test/helpers/initialized_app');
        logger = require('../../lib/logger'); // mocked
    });

    it("should error on invalid attributes", function() {
        var attrs = "fake";

        Taplytics.identify(attrs);

        expect(logger.error).toBeCalled();
    });
});

describe("Taplytics::identify - server calls", function() {
    var Taplytics;

    beforeEach(function() {
        Taplytics = require('../../../test/helpers/initialized_app');
    });

    it("should attempt to update and create user", function() {
        var attrs = {
            valid: "attrs"
        };

        Taplytics.identify(attrs);

        expect(Taplytics.api.users.post).toBeCalled();
    });

    it("should parse known top level keys and custom variables", function() {
        var attrs = {
            user_id: 1,
            email: "nima@Taplytics.com",
            name: "Nima Gardideh",
            firstName: "Nima",
            lastName: "Gardideh",
            avatarUrl: "https://google.com",
            age: 23,
            gender: "male",
            custom_var: "test"
        };

        Taplytics.identify(attrs);

        var usersPostCalls = Taplytics.api.users.post.mock.calls;

        // Check if last called was with a proper second argument
        expect(usersPostCalls[usersPostCalls.length - 1][0]).toEqual({
            user_id: 1,
            email: "nima@Taplytics.com",
            name: "Nima Gardideh",
            firstName: "Nima",
            lastName: "Gardideh",
            avatarUrl: "https://google.com",
            age: 23,
            gender: "male",
            customData: {
                custom_var: "test"
            }
        });
    });
});
