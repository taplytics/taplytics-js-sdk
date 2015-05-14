var swizzle = require('../lib/swizzle');
var logger = require('./logger');

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
    //     logger.log("Taplytics: Listening on history changes to track sessions.", null, logger.LOG);

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

//     logger.log("onpopstate:", e, logger.DEBUG);
//     logger.log("location:", exports.toObject(), logger.DEBUG);
// }

// function onpushstate(stateObj, title, state) {
//  // exports.toObject won't work as pushState doesn't change document.location

//     logger.log("onpushstate:", state, logger.DEBUG);
//     logger.log("location", exports.toObject(), logger.DEBUG);
// }

// function onreplacestate(stateObj, title, state) {
//     logger.log("onreplacestate:", state, logger.DEBUG);
//     logger.log("location", exports.toObject(), logger.DEBUG);    
// }

// function onhashchange(e) {
//  logger.log("onhashchange:", e, logger.DEBUG);
//     logger.log("location:", exports.toObject(), logger.DEBUG);
// }