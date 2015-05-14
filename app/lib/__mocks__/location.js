// Fake location object

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
};


function locationAttribute(attr) {
    return null;
};