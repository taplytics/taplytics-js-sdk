jest.dontMock('../session');

var should = require('should');
var Cookies = require('cookies'); // mocked
var uuidGenerator = require('uuid'); // mocked


var cookieConfig = {
    cookieSessionID: '_tl_csid',
    sessionUUID: '_tl_suuid',

    // Correspond to models on our system:
    sessionID: '_tl_sid',
    appUserID: '_tl_auid',
    sessionOptions: function(sessionID, key) {
        if (!sessionID || !key)
            return null;

        return 'tl_sopts_' + sessionID + '_' + key;
    }
};


describe("Session", function() {
    it("should start a session an ID and UUID cookies", function() {
        Cookies.__reset__();

        var session = require('../session');

        session.start();

        // Check values
        var session_uuid = Cookies.get(cookieConfig.sessionUUID);
        var cookie_session_id = Cookies.get(cookieConfig.cookieSessionID);

        expect(session_uuid).not.toBeUndefined();
        expect(session_uuid).not.toBeNull();
        expect(session_uuid).toEqual('mocked_v4_uuid'); 
        expect(cookie_session_id).not.toBeUndefined();
        expect(cookie_session_id).not.toBeNull();
        expect(cookie_session_id).toEqual('mocked_v4_uuid'); 

        // Check getters
        expect(session.getCookieSessionID()).toEqual("mocked_v4_uuid");
        expect(session.getSessionUUID()).toEqual("mocked_v4_uuid");
    });

    it("should set the App User ID", function() {
        Cookies.__reset__();

        var session = require('../session');

        session.setAppUserID("user_id");

        // Check cookie
        expect(Cookies.get(cookieConfig.appUserID)).toEqual('user_id');

        // Check getter
        expect(session.getAppUserID()).toEqual('user_id');
    });

    it("should set the Session ID", function() {
        Cookies.__reset__();

        var session = require('../session');

        session.setSessionID("session_id");

        // Check cookie
        expect(Cookies.get(cookieConfig.sessionID)).toEqual('session_id');

        // Check getter
        expect(session.getSessionID()).toEqual('session_id');
    });

    it("should tick when setting", function() {
        var session = require('../session');
        session.tick = jest.genMockFn();

        session.set("test", "var");
        expect(session.tick).toBeCalled();
    });

    it("should tick when getting", function() {
        var session = require('../session');
        session.tick = jest.genMockFn();

        session.get("test");
        expect(session.tick).toBeCalled();
    });
});
