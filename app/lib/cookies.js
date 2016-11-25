var log = require('./logger');

var lscache = require('lscache');
var CookieJar = require('cookiejar').CookieJar;
var Cookie = require('cookiejar').Cookie;
var CookieAccess = require('cookiejar').CookieAccessInfo;
var accessInfo = new CookieAccess();

exports.get = function(key, useLS) {
    if (getCookieSupport() && !useLS) {
        var jar = getJar();
        var cookie = jar.getCookie(key, accessInfo);
        if (!cookie) return;

        return cookie.value;
    }
    else {
        // Use local storage
        var value = lscache.get(key);
        log.log("Got local storage key: " + key + " with value: " + value, log.LOUD);
        return value;
    }
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
    else {
        var expiry = null;
        if (options && options.expires) {
            expiry = 30;
        }
        lscache.set(key, value, expiry);
        log.log("Setting local storage key: " + key + " to value: " + value, log.LOUD);
    }
};

exports.expire = function(key, useLS) {
    if (getCookieSupport() && !useLS) {
        exports.set(key, "-", {expires: new Date()});
    }
    else {
        log.log("Deleting local storage key: " + key, log.LOUD);
        lscache.remove(key);
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
            cValue = ca[i];
            while (cValue.charAt(0) == ' ') {
                cValue = cValue.substring(1);
            }

            staticJar.setCookies(cValue);
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
