var logger = require('../lib/logger');
var api = require('../api');
var location = require('../lib/location');

var currentView = null;

var sessionConfigOptions = {
    previous_page_href: 'previous_page_location_href',
    previous_page_title: 'previous_page_location_title',
    previous_page_location: 'previous_page_location',
    previous_page_name: 'previous_page_name',
    previous_page_category: 'previous_page_category',
    previous_page_view_date: 'previous_page_view_date'
};

module.exports = function(app) {
    return function(category, name, attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::track: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }
        
        var cat_name = category;
        var view_name = name;
        var attributes = attrs;
        var session = app._in.session;

        if (typeof name === 'object' && !attrs) { // for when function is used as (name, attrs)
            cat_name = undefined;
            view_name = category;
            attributes = name;
        }

        session.tick(); // tick the session

        // If we have a previous page in the session:
        // 1. Send a page close (viewDisappeared) event
        // 2. Send a time on page (viewTimeOnPage) event
        // 3. Clean up session and set the new page to the current one

        if (session.get(sessionConfigOptions.previous_page_href)) {
            var opts = getPreviousPage(session);

            api.events.pageClose(opts.category, 
                                 opts.name,
                                 opts.href,
                                 opts.title,
                                 opts.location);
            
            api.events.timeOnPage(opts.category,
                                  opts.name,
                                  opts.href,
                                  opts.title,
                                  opts.location,
                                  opts.view_date);

            unsetPreviousPage(session);
        }

        api.events.pageView(cat_name,
                            view_name,
                            attributes);

        setPreviousPage(session, cat_name, view_name);
        return app;
    };
};


// Helper functions

function getPreviousPage(session) {
    var view_date = session.get(sessionConfigOptions.previous_page_view_date);

    if (view_date)
        view_date = new Date(view_date);

    return {
        category: session.get(sessionConfigOptions.previous_page_category), 
        name: session.get(sessionConfigOptions.previous_page_name),
        href: session.get(sessionConfigOptions.previous_page_href),
        title: session.get(sessionConfigOptions.previous_page_title),
        location: session.get(sessionConfigOptions.previous_page_location, JSON && JSON.parse),
        view_date: view_date
    };
}

function setPreviousPage(session, category, name) {
    session.set(sessionConfigOptions.previous_page_category, category);
    session.set(sessionConfigOptions.previous_page_name, name);
    session.set(sessionConfigOptions.previous_page_href, location.attr('href'));
    session.set(sessionConfigOptions.previous_page_title, location.attr('title'));
    session.set(sessionConfigOptions.previous_page_location, location.toObject(), JSON && JSON.stringify);
    session.set(sessionConfigOptions.previous_page_view_date, (new Date()).toISOString());
}

function unsetPreviousPage(session) {
    session.unset(sessionConfigOptions.previous_page_category);
    session.unset(sessionConfigOptions.previous_page_name);
    session.unset(sessionConfigOptions.previous_page_href);
    session.unset(sessionConfigOptions.previous_page_title);
    session.unset(sessionConfigOptions.previous_page_location);
    session.unset(sessionConfigOptions.previous_page_view_date);
}
