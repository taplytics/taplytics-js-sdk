var log = require('./logger');
var _ = require('./tools');

var lscache = require('lscache');
var CookieJar = require('cookiejar').CookieJar;
var Cookie = require('cookiejar').Cookie;
var CookieAccess = require('cookiejar').CookieAccessInfo;
var accessInfo = new CookieAccess();

if (!lscache.supported()) {
    log.log("Local Storage not supported", null, log.DEBUG);
    lscache = null;
}

exports.getJSON = function(key, useLS) {
    var jsonValue = exports.get(key, useLS);
    if (jsonValue && _.isString(jsonValue)) {
        try {
            return JSON.parse(jsonValue);
        } catch(ex) {
            log.error("JSON parse cookie value", ex, log.DEBUG);
            return null;
        }
    }
    else {
        return jsonValue;
    }
};

exports.getLS = function(key) {
    if (!lscache) return null;

    var value = lscache.get(key);
    log.log("Got local storage key: " + key + " with value: " + value, null, log.LOUD);
    return value;
}

exports.get = function(key, useLS) {
    if (getCookieSupport() && !useLS) {
        var jar = getJar();
        var cookie = jar.getCookie(key, accessInfo);
        if (!cookie) return;

        return cookie.value;
    }
    else if (lscache) {
        return exports.getLS(key);
    }
    else if (useLS) {
        return exports.get(key);
    }
};

exports.setJSON = function(key, value, options, useLS) {
    var jsonStr;
    try {
        if (_.isString(value)) {
            jsonStr = value;
        } else {
            jsonStr = JSON.stringify(value);
        }
    } catch(ex) {
        log.error("JSON stringify cookie value", ex, log.DEBUG);
    }
    exports.set(key, jsonStr, options, useLS);
};

exports.set = function(key, value, options, useLS) {
    if (!key) return;

    if (getCookieSupport() && !useLS) {
        value   = value || "";
        options = options || {};

        var cookieJar = getJar();
        var cookieToSet = keyValueToCookie(key, value, options.expires);
        var cookieStr = cookieToSet.toString();
        document.cookie = cookieStr;
        cookieJar.setCookie(cookieStr);

        log.log("Setting cookies to:", cookieStr, log.LOUD);
    }
    else if (lscache) {
        exports.setLS(key, value, options);
    }
    else if (useLS) {
        exports.set(key, value, options);
    }
};

exports.setLS = function(key, value, options) {
    if (!lscache) return;

    var expiry = (options && options.expires) ? 30 : null;
    lscache.set(key, value, expiry);
    log.log("Setting local storage key: " + key + " to value: " + value, null, log.LOUD);
}

exports.expire = function(key, useLS) {
    if (getCookieSupport() && !useLS) {
        exports.set(key, "-", {expires: new Date()});
    }
    else if (lscache) {
        log.log("Deleting local storage key: " + key, log.LOUD);
        lscache.remove(key);
    }
    else if (useLS) {
        exports.expire(key);
    }
};

var staticJar;
function getJar() {
    if (!staticJar) {
        staticJar = new CookieJar();
        updateJar();
    }
    return staticJar;
}

function updateJar() {
    if (staticJar && document.cookie && document.cookie.length) {
        var ca = document.cookie.split(';');
        var cValue;

        for (var i = 0; i < ca.length; i++) {
            try {
                cValue = ca[i];
                while (cValue.charAt(0) == ' ') {
                    cValue = cValue.substring(1);
                }

                staticJar.setCookies(cValue);
            } catch(ex) {
                log.error("Exception setting cookie", ex, log.DEBUG);
            }
        }
    }
}

function keyValueToCookie(key, value, expiration) {
    var cookieStr = key + "=" + value;
    // if (value)
    //     cookieStr += "=" + value;

    var cookie = new Cookie(cookieStr);
    if (expiration)
        cookie.expiration_date = expiration;

    return cookie;
}

//
// Find out what cookies are supported. Returns:
// null - no cookies
// false - only session cookies are allowed
// true - session cookies and persistent cookies are allowed
// (though the persistent cookies might not actually be persistent, if the user has set
// them to expire on browser exit)
//
var cookieSupport = undefined;
function getCookieSupport() {
    if (cookieSupport !== undefined) return cookieSupport;

    var persist = true;
    do {
        var c = 'gCStest=' + Math.floor(Math.random() * 100000000);
        document.cookie = persist ? c + ';expires=Tue, 01-Jan-2030 00:00:00 GMT' : c;
        if (document.cookie.indexOf(c) !== -1) {
            document.cookie = c + ';expires=Sat, 01-Jan-2000 00:00:00 GMT';
            cookieSupport = persist;
            return persist;
        }
    } while (!(persist = !persist));
    cookieSupport = null;
    return null;
}
