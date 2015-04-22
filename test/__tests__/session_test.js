jest.autoMockOff();
jest.setMock('../../app/app.js', require('../../app/__mocks__/app.js'));
var should = require('should');
var Cookies = require.requireActual('cookies-js');
var uuidGenerator = jest.genMockFromModule('uuid');

var v4 = function() {
    return "mock_uuid";
}

uuidGenerator.v4.mockImplementation(v4);
jest.setMock('uuid', uuidGenerator);

function newApp() {
    return require('../helpers/initialized_app');
}

function testSession(app) {
    var session = require.requireActual('../../app/session')(app);
    return session;
}

function getProperCookieConfig(app) {
    var cookieConfig = {
        cookieSessionID: '_tl_csid_' + app._in.token,
        sessionUUID: '_tl_suuid_' + app._in.token,

        // Correspond to models on our system:
        sessionID: '_tl_sid_' + app._in.token,
        appUserID: '_tl_auid_' + app._in.token,
        sessionOptions: function(sessionID, key) {
            if (!sessionID || !key)
                return null;

            return 'tl_sopts_' + app._in.token + '_' + sessionID + '_' + key;
        }
    };
    return cookieConfig;
}

describe("Session", function() {
    it("should start a session with a cookie", function() {
        var app = newApp();
        var session = testSession(app);
        session = session.start();
        var proper_cookie = getProperCookieConfig(app);
        var session_uuid = session.getCookieSessionID();
        var cookie_session_id = session.getCookieSessionID();
        var cookieConfig = getProperCookieConfig(app);
        expect(session_uuid).not.toBeUndefined();
        expect(session_uuid).not.toBeNull();
        expect(session_uuid).toEqual('mock_uuid'); // Mocked ID
        expect(cookie_session_id).not.toBeUndefined();
        expect(cookie_session_id).not.toBeNull();
        expect(cookie_session_id).toEqual('mock_uuid'); // Mocked ID

    });
    it("should set the App User ID", function() {
        var app = newApp();
        var session = testSession(app);
        session.setAppUserID("user_id");
        expect(Cookies.get(getProperCookieConfig(app).appUserID)).toEqual('user_id');
    });
});
