var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
	return function(user_id, attrs) {
		if (!app.token || !app.session) {
			logger.error("Taplytics::identify: you have to call Taplytics.init first.", null, 1);
			return null;
		}

		var params = {
			token: app.token
		};

		var payload = {
			client_id: app.session.getSessionID(),
			user_attributes: attrs
		};

		if (isEmail(user_id))
			payload.email = user_id;
		else
			payload.user_id = user_id;

		api.clients.update(params, payload);

		return app;
	};
};

function isEmail(str) {
	return (typeof str === 'string') && str.indexOf('@') !== -1;
}