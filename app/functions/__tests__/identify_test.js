jest.dontMock('../identify');

var Taplytics = require.requireActual('../../../test/helpers/initialized_app');
var TaplyticsUninitialized = require.requireActual('../../../test/helpers/uninitialized_app');
var should = require.requireActual('should');

var logger = require('../../lib/logger'); // mocked
var api = require('../../api');

describe("Taplytics.identify - arguments", function() {
    it("should error on invalid attributes", function() {
        var attrs = "fake";

        Taplytics.identify(attrs);

        expect(logger.error).toBeCalled();
    });

    it("should error on uninitialized SDK", function() {
        var attrs = {
            valid: "attrs"
        };

        TaplyticsUninitialized.identify(attrs);

        expect(logger.error).toBeCalled();
    });
});

describe("Taplytics::identify - server calls", function() {
    it("should attempt to update and create user", function() {
        var attrs = {
            valid: "attrs"
        };

        Taplytics.identify(attrs);

        expect(api.users.post).toBeCalled();
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

        var usersPostCalls = api.users.post.mock.calls;

        // Check if last called was with a proper second argument
        expect(usersPostCalls[usersPostCalls.length - 1][1]).toEqual({
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
