module.exports = function() {
    var searchParams = {
        fake: "Search params",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "jest",
        utm_term: "hi",
        utm_content: "ad"
    };

    var referrer = "fake referrer";

    var source = {
        referrer: referrer,
        search: searchParams
    };

    return source;
};
