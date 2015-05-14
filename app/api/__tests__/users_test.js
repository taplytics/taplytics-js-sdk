var should = require.requireActual('should');
var Cookies = require('cookies-js');

jest.mock('../base'); // mock api.request
jest.dontMock('../../api');
jest.dontMock('../users');

describe("api.users.post", function() {
    var api;
    var session;
    var Taplytics;

    beforeEach(function() {
        api = require('../../api');
        session = require('../../lib/session');
        Taplytics = require('../../../test/helpers/initialized_app');
    });

    it("should make a post to the server", function(done) {
        var api = require('../../api');

        var Taplytics = require('../../../test/helpers/initialized_app');

        var user_attrs = {
            gender: "xe"
        };

        api.users.post(Taplytics, user_attrs, "fail", function(err, response){});

        expect(api.request.post).toBeCalled();
    });

    it("should make a post with the right session data", function() {
        var sourceData = require('../../lib/source')();
        var locationData = require('../../lib/location').toObject();

        var user_attrs = {
            user_id: 1
        };

        api.users.post(Taplytics, user_attrs, "fail", function(){});

        expect(api.request.post).lastCalledWith(api.users.users_path, {
            public_token: Taplytics._in.token
        }, {
            session: {
                sid: session.getSessionID(),
                ad: session.getSessionUUID(),
                adt: 'browser',
                ct: 'browser',
                lv: '1',
                rfr: sourceData.referrer,
                exs: sourceData.utm_source,
                exm: sourceData.utm_medium,
                exc: sourceData.utm_campaign,
                ext: sourceData.utm_term,
                exct: sourceData.utm_content,
                prms: {
                    search: sourceData.search,
                    location: locationData,
                    userAgent: navigator.userAgent
                }
            },
            app_user: {
                auid: session.getAppUserID(),
                user_id: 1
            }
        }, jasmine.any(Function));
    });

    it("should handle a bad response", function() {
        var logger = require('../../lib/logger')

        var error = new Error("Test Error");
        var mockedFunc = jest.genMockFn();

        api.request.post.mockImpl(function(path, params, payload, callback) {
            callback(error);
        });

        api.users.post(Taplytics, {}, "Fail Message", mockedFunc);

        expect(mockedFunc).toBeCalledWith(error, undefined);
        expect(logger.error).toBeCalledWith("Fail Message", error, jasmine.any(Number));
    });

    it("should handle a successful response", function() {
        var response = {
            body: {
                app_user_id: 1,
                session_id: 2
            }
        };
        var mockedFunc = jest.genMockFn();

        api.request.post.mockImpl(function(path, params, payload, callback) {
            callback(null, response);
        });

        api.users.post(Taplytics, {}, "Fail", mockedFunc);

        expect(session.setAppUserID).toBeCalledWith(1);
        expect(session.setSessionID).toBeCalledWith(2);
        expect(session.tick).toBeCalled();
        expect(mockedFunc).toBeCalledWith(null, response);
    });
});
