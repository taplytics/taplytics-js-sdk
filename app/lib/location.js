var swizzle = require('../lib/swizzle');
var log = require('./logger');

var override = {};

exports.toObject = function() {
    return {
        href: locationAttribute('href'),
        hash: locationAttribute('hash'),
        search: locationAttribute('search'),
        host: locationAttribute('host'),
        protocol: locationAttribute('protocol'),
        pathname: locationAttribute('pathname'),
        title: locationAttribute('title')
    };
};

exports.attr = function(key) {
    return locationAttribute(key);
};

exports.listen = function(app) {

    // TODO: pushState / onpopstate / onhashchange
    // if (window.history) {
    //     log.log("Taplytics: Listening on history changes to track sessions.", null, log.LOG);

    //     window.addEventListener('popstate', onpopstate);

    //     if (window.history.pushState) {
    //         swizzle(window.history, 'pushState', onpushstate, window.history);
    //         swizzle(window.history, 'replaceState', onreplacestate, window.history);
    //     } else
    //         window.addEventListener('hashchange', onhashchange);
    // }
};


function locationAttribute(attr) {
    if (override[attr])
        return override[attr];

    if (attr === 'title')
        return document.title;

    if (document.location)
        return document.location[attr];
    else return null;
};

// function onpopstate(e) {
//  // exports.toObject will work just fine here.

//     log.log("onpopstate:", e, log.DEBUG);
//     log.log("location:", exports.toObject(), log.DEBUG);
// }

// function onpushstate(stateObj, title, state) {
//  // exports.toObject won't work as pushState doesn't change document.location

//     log.log("onpushstate:", state, log.DEBUG);
//     log.log("location", exports.toObject(), log.DEBUG);
// }

// function onreplacestate(stateObj, title, state) {
//     log.log("onreplacestate:", state, log.DEBUG);
//     log.log("location", exports.toObject(), log.DEBUG);
// }

// function onhashchange(e) {
//  log.log("onhashchange:", e, log.DEBUG);
//     log.log("location:", exports.toObject(), log.DEBUG);
// }
