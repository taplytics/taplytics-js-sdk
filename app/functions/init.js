var log = require('../lib/logger');
var location = require('../lib/location');
var session = require('../lib/session');
var cookies = require('../lib/cookies');

var auto_page_view = true;

module.exports = function(token, options) {
    if (!isValidToken(token)) {
        log.error("An SDK token is required.", null, log.USER);
        return undefined;
    }

    this.env = "production";

    if (options) {
        if (options.log_level)
            log.setPriorityLevel(options.log_level);

        if (options.auto_page_view === false)
            auto_page_view = false;

        if (options.env)
            this.env = options.env;
    }

    /* Initialization */
    // internal data
    this._in = {};
    this._in.token   = token;

    // Expose this, in case we want to override log level after initialization.
    this._in.logger  = log;
    this._in.cookies = cookies;

    // Let API know about our token.
    this.api.init(this);

    /* Start a session */
    session.start();

    this.api.config.get();

    /* Track current page and other page views. */
    // location.listen(app);

    if (auto_page_view && this.page)
        this.page();

    // Initiate flushQueue:
    this.api.events.scheduleTick();

    return this;
};

// Helper functions
function isValidToken(token) {
    if (!token || typeof token !== "string")
        return false;

    return (!!token.length);
}
