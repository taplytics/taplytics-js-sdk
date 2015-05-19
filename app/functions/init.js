var logger = require('../lib/logger');
var location = require('../lib/location');
var session = require('../lib/session');
var cookies = require('../lib/cookies');

var auto_page_view = true;

module.exports = function(token, options) {
    if (!isValidToken(token)) {
        logger.error("An SDK token is required.", null, logger.USER);
        return undefined;
    }

    this.env = "production";

    if (options) {
        if (options.log_level)
            logger.setPriorityLevel(options.log_level);

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
    this._in.logger  = logger;
    this._in.cookies = cookies;

    // Let API know about our token.
    this.api.init(this);

    /* Start a session */
    session.start();

    this.api.users.post({}, "Init failed. Taplytics will not function properly.");

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
    if (!token)
        return false;

    if (typeof token !== "string")
        return false;

    if (!token.length)
        return false;

    return true;
}
