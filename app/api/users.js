var location = require('../lib/location');
var platform = require('platform');
var source = require('../lib/source');
var logger = require('../lib/logger');


var users_path = 'users';

module.exports = function(api) {

	var createUser = function(app, user_attrs, failure_message) {
		var locationData = location(); // document.location
	    var sourceData = source(); // documen.referrer + location.search
	    var appUser = user_attrs;
	    var session = {};

	    if (!appUser)
	    	appUser = {};

	    session.sid = app._in.session.getSessionID();
	    session.ad  = app._in.session.getSessionUUID();
	    session.adt = 'browser';
	    session.ct  = 'browser';
	    session.lv  = false; // liveUpdate
	    session.rfr = sourceData.referrer;
	    session.prms = {
	        search: sourceData.search,
	        location: locationData,
	        platform: platform
	    };

	    if (platform) {
	        session.os = platform.os.family;
	        session.osv = platform.os.version;
	        session.ma = platform.manufacturer;
	        session.br = platform.product;
	        session.bron = platform.name;
	        session.brov = platform.version;
	        session.brol = platform.layout;
	    }

	    appUser.auid = app._in.session.getAppUserID();

	    var params = {
	        public_token: app._in.token
	    };

	    var payload = {
	        session: session,
	        app_user: appUser
	    };

	    logger.log("Taplytics::Users.createUser", payload);
	    post(params, payload, function(err, response) {
	        if (err) {
	            logger.error(failure_message, err, logger.USER);
	        } else {
	            var data = response.body;

	            if (data) {
	                logger.log("Taplytics::Users.createUser: successfully created/updated user.", response, logger.DEBUG);

	                var appUserID = data.app_user_id;
	                var sessionID = data.session_id;

	                app._in.session.setAppUserID(appUserID);
	                app._in.session.setSessionID(sessionID);
	                app._in.session.tick();
	            } else {
	                logger.error(failure_message, null, logger.USER);
	            }
	        }
	    });
	};

	var post = function(params, payload, callback) {
		logger.log("users_post", payload, logger.DEBUG);

		api.post(users_path, params, payload, function(err, res) {
			callback(err, res);
		});
	};

	var update = function(params, payload) {
		logger.log("users_update", payload, logger.DEBUG);
		
		api.post(users_path, params, payload, function(err, res) {
			logger.log("users_post results:", res);
			//  if (err) // schedule?
		});
	};

	return {
		createUser: createUser,
		post: post,
		update: update
	};
};
