var logger = require('../lib/logger');
var api = require('../api');
var userAgent = require('../lib/userAgent');
var location = require('../lib/location');
var searchParams = require('../lib/searchParams');

module.exports = function(app) {
	return function(token) {
		if (!token) {
			logger.error("Taplytics: an SDK token is required.", null, 1);
			return null;
		}

		app.token = token;

		app.session = require('../session')(app.token);

		app.session.start();

		var params = {
			token: token
		};

		var payload = {
			client_id: app.session.getSessionID(),
			userAgent: userAgent(),
			location: location(),
			searchParams: searchParams()
		};

		api.clients.post(params, payload);
		return app;
	};
};