jest.dontMock('../track');

describe("Taplytics.track - uninitialized app", function() {
    it("should error on if app is not initialized", function() {
        var TaplyticsUninitialized = require('../../../test/helpers/uninitialized_app');
        var logger = require('../../lib/logger');

        TaplyticsUninitialized.track("Event Name");

        expect(logger.error).toBeCalled();
    });
});

describe("Taplytics.track - arguments", function() {

    var Taplytics;
    var api;

    beforeEach(function() {
        Taplytics = require.requireActual('../../../test/helpers/initialized_app');
        api = require('../../api');        
    });

    it('should reject bad arguments', function() {
        var logger = require('../../lib/logger');

        Taplytics.track();

        expect(logger.error).toBeCalled();
        logger.error.mockClear();

        Taplytics.track(null, 10, {});

        expect(logger.error).toBeCalled();
        logger.error.mockClear();

        Taplytics.track("name", "test");

        expect(logger.error).toBeCalled();
        logger.error.mockClear();
    });

    it("should handle argument permutations", function() {
        Taplytics.track("name");

        expect(api.events.goalAchieved).lastCalledWith("name", undefined, undefined);

        Taplytics.track("name", {
            attr: 1
        });

        expect(api.events.goalAchieved).lastCalledWith("name", undefined, {
            attr: 1
        });

        Taplytics.track("name", 10);

        expect(api.events.goalAchieved).lastCalledWith("name", 10, undefined);

        Taplytics.track("name", 12, {
            attr: 1
        });

        expect(api.events.goalAchieved).lastCalledWith("name", 12, {
            attr: 1
        });

        Taplytics.track("name", null, {
            attr: 1
        });

        expect(api.events.goalAchieved).lastCalledWith("name", null, {
            attr: 1
        });
    });
});
