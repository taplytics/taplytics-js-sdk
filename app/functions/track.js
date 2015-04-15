var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
	return function(user_id, attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::identify: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }
        
		var params = {
			token: app.token
		};

		var payload = {
			user_id: user_id,
			user_attributes: attrs
		};

		api.clients.post(params, payload);

		return app;
	};
};