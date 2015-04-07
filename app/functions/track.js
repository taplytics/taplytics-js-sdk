var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
	return function(user_id, attrs) {
		if (!app.token) {
			logger.error("Taplytics::identify: an SDK token is required.", null, 1);
			return null;
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