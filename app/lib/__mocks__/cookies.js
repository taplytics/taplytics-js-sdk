// This class mocks the Cookies object for testing

const cookies = jest.genMockFromModule('../cookies');
window.cookie_storage = window.cookie_storage || {};


function get(key) {
    if (window.cookie_storage[key])
        return window.cookie_storage[key].value;

    return undefined;
};

function set(key, value, opts) {
    window.cookie_storage[key] = {
        value: value,
        opts: opts
    };
};

function expire(key) {
    delete window.cookie_storage[key];
};

// Helper functions:
function __reset__() {
    window.cookie_storage = {};
};

function __get_storage__() {
    return window.cookie_storage;
};

function __get_options__(key) {
    if (window.cookie_storage[key])
        return window.cookie_storage[key].opts;

    return undefined;
};

cookies.get = get;
cookies.set = set;
cookies.expire = expire;
cookies.__get_storage__ = __get_storage__;
cookies.__reset__ = __reset__;
cookies.__get_options__ = __get_options__;
module.exports = cookies;
