jest.mock('../base'); // mock api.request
jest.dontMock('../../api');
jest.dontMock('../users');

describe("api.users.post", function() {
    var session;
    var Taplytics;

    beforeEach(function() {
        session = require('../../lib/session');
        Taplytics = require('../../../test/helpers/initialized_app');
    });

    it("should make a post to the server", function(done) {
        var user_attrs = {
            gender: "xe"
        };

        Taplytics.api.users.post(Taplytics, user_attrs, "fail", function(err, response){});

        expect(Taplytics.api.request.post).toBeCalled();
    });

    it("should make a post with the right session data", function() {
        var sourceData = require('../../lib/source')();
        var locationData = require('../../lib/location').toObject();

        var user_attrs = {
            user_id: 1
        };

        Taplytics.api.users.post(user_attrs, "fail", function(){});

        expect(Taplytics.api.request.post).lastCalledWith(Taplytics.api.users.users_path, {}, {
            session: {
                sid: session.getSessionID(),
                ad: session.getDeviceUUID(),
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

        Taplytics.api.request.post.mockImpl(function(path, params, payload, callback) {
            callback(error);
        });

        Taplytics.api.users.post({}, "Fail Message", mockedFunc);

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

        Taplytics.api.request.post.mockImpl(function(path, params, payload, callback) {
            callback(null, response);
        });

        Taplytics.api.users.post({}, "Fail", mockedFunc);

        expect(session.setAppUserID).toBeCalledWith(1);
        expect(session.setSessionID).toBeCalledWith(2);
        expect(session.tick).toBeCalled();
        expect(mockedFunc).toBeCalledWith(null, response);
    });
});
