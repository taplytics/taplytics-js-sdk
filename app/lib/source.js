var Qs = require('qs');

module.exports = function() {
    var searchParams = {};
    var referrer = null;

    if (location && location.search && location.search.length)
         searchParams = Qs.parse(location.search.substr(1));

    if (document && document.referrer)
        referrer = document.referrer;

    var source = {
        referrer: referrer,
        search: searchParams
    };

    return source;
};
