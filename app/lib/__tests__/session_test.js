jest.dontMock('../session');
jest.mock('../cookies');

var should = require('should');
var Cookies = require('../cookies');

var cookieConfig = {
    cookieSessionID: '_tl_csid',
    deviceUUID: '_tl_duuid',
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
        var device_uuid = Cookies.get(cookieConfig.deviceUUID);
        var cookie_session_id = Cookies.get(cookieConfig.cookieSessionID);

        expect(device_uuid).not.toBeUndefined();
        expect(device_uuid).not.toBeNull();
        expect(device_uuid).toEqual('mocked_v4_uuid');
        expect(cookie_session_id).not.toBeUndefined();
        expect(cookie_session_id).not.toBeNull();
        expect(cookie_session_id).toEqual('mocked_v4_uuid');

        // Check getters
        expect(session.getCookieSessionID()).toEqual("mocked_v4_uuid");
        expect(session.getDeviceUUID()).toEqual("mocked_v4_uuid");
    });

    it("should keep the duuid across sessions", function() {
        Cookies.__reset__();
        var session = require('../session');
        session.start();
        var device_uuid = Cookies.get(cookieConfig.deviceUUID);

        session.resetSession();
        session.start();
        var device_uuid_2 = Cookies.get(cookieConfig.deviceUUID);
        expect(device_uuid).toEqual(device_uuid_2);
    });

    it("should handle the old suuid format", function() {
        Cookies.__reset__();
        var session = require('../session');
        Cookies.set("_tl_csid", "ID");
        Cookies.set("_tl_suuid", "sessionID");
        session.start();

        var device_uuid = Cookies.get(cookieConfig.deviceUUID);
        var session_uuid = Cookies.get(cookieConfig.sessionUUID);
        expect(session_uuid).toEqual("sessionID");
        expect(device_uuid).toEqual("sessionID");
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
