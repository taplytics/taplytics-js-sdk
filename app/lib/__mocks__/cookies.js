// This class mocks the Cookies object for testing

window.cookie_storage = window.cookie_storage || {};


exports.get = function(key) {
    if (window.cookie_storage[key])
        return window.cookie_storage[key].value;

    return undefined;
};

exports.set = function(key, value, opts) {
    window.cookie_storage[key] = {
        value: value,
        opts: opts
    };
};

exports.expire = function(key) {
    delete window.cookie_storage[key];
};

// Helper functions:
exports.__reset__ = function() {
    window.cookie_storage = {};
};

exports.__get_storage__ = function() {
    return window.cookie_storage;
};

exports.__get_options__ = function(key) {
    if (window.cookie_storage[key])
        return window.cookie_storage[key].opts;

    return undefined;
};