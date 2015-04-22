jest.autoMockOff();
jest.setMock('../../app/app.js', require('../../app/__mocks__/app.js'));
jest.mock('../../app/api/events');
jest.mock('../../app/api/events');
jest.mock('../../app/api/base');
var should = require('should');
var Cookies = require.requireActual('cookies-js');

function newApp() {
    var app = require('../helpers/initialized_app');
    app.track = require('../../app/functions/track')(app);
    app.page = require('../../app/functions/page')(app);
    return app;
}

describe("Page tracking", function() {
    it("should call a page view event when the page is viewed with no previous page view", function() {
        var Taplytics = newApp();
        var events = require('../../app/api/events');
        expect(events.pageView.mock.calls.length).toBe(0);
        Taplytics.page('page_category', 'page_name', {'attributes': true}); // This should call the API
        expect(events.pageView.mock.calls.length).toBe(1);
    });
    it("should call a page view event when the page is viewed with a previous page view", function() {
        var Taplytics = newApp();
        var events = require('../../app/api/events');
        Taplytics._in.session.get = jest.genMockFn();
        Taplytics._in.session.get.mockImpl(function() { return {name: "name", href: "href", title: "title"} });
        expect(events.pageClose.mock.calls.length).toBe(0);
        expect(events.timeOnPage.mock.calls.length).toBe(0);
        Taplytics.page('page_category', 'page_name', {'attributes': true}); // This should call the API
        expect(events.pageClose.mock.calls.length).toBe(1);
        expect(events.timeOnPage.mock.calls.length).toBe(1);

    });
});