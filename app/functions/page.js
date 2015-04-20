var logger = require('../lib/logger');
var api = require('../api');
var location = require('../lib/location');

var currentView = null;

module.exports = function(app) {
    return function(category, name, attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::track: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }
        
        var cat_name = category;
        var view_name = name;
        var attributes = attrs;

        if (typeof name === 'object' && !attrs) { // for when function is used as (name, attrs)
            cat_name = undefined;
            view_name = category;
            attributes = name;
        }

        app._in.session.tick(); // tick the session

        api.events.pageView(cat_name,
                            view_name,
                            attributes);

        return app;
    };
};