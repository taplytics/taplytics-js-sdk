jest.dontMock('../page');
jest.dontMock('../../lib/session');

var should = require.requireActual('should');
var Cookies = require('cookies-js');

describe("Taplytics.page - arguments", function() {
    it("should error on if app is not initialized", function() {
        var TaplyticsUninitialized = require('../../../test/helpers/uninitialized_app');
        var logger = require('../../lib/logger');

        TaplyticsUninitialized.page();

        expect(logger.error).toBeCalled();
    });

    it("should handle argument permutations", function() {
        var Taplytics = require.requireActual('../../../test/helpers/initialized_app');
        var api = require('../../api');

        Taplytics.page("name");

        expect(api.events.pageView).lastCalledWith(undefined, "name", undefined);

        Taplytics.page("name", {
            attr: 1
        });

        expect(api.events.pageView).lastCalledWith(undefined, "name", {
            attr: 1
        });

        Taplytics.page("cat", "name");

        expect(api.events.pageView).lastCalledWith("cat", "name", undefined);

        Taplytics.page("cat", "name", {
            attr: 1
        });

        expect(api.events.pageView).lastCalledWith("cat", "name", {
            attr: 1
        });
    });
});

describe("Taplytics.page - server", function() {
    it("should call a page view event when the page is viewed with no previous page view", function() {
        var Taplytics = require.requireActual('../../../test/helpers/initialized_app');
        var api = require('../../api');

        expect(api.events.pageView.mock.calls.length).toBe(1); // init calls this once

        Taplytics.page('page_category', 'page_name', {'attributes': true}); // This should call the API

        expect(api.events.pageView.mock.calls.length).toBe(2);
    });

    it("should call a page view event when the page is viewed with a previous page view", function() {
        var Taplytics = require.requireActual('../../../test/helpers/initialized_app');
        var api = require('../../api');
        var session = require('../../lib/session');

        session.get = jest.genMockFn();
        session.get.mockImpl(function() { return {name: "name", href: "href", title: "title"}; });

        expect(api.events.pageClose.mock.calls.length).toBe(0);
        expect(api.events.timeOnPage.mock.calls.length).toBe(0);

        Taplytics.page('page_category', 'page_name', {'attributes': true}); // This should call the API

        expect(api.events.pageClose.mock.calls.length).toBe(1);
        expect(api.events.timeOnPage.mock.calls.length).toBe(1);

    });

    // TODO:
    // Check attributes are being sent properly to pageClose, timeOnPage and pageView to the server
});
