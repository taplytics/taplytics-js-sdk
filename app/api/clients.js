var clients_path = 'clients';
var logger = require('../lib/logger');

module.exports = function(api) {

	var post = function(params, payload) {
		logger.log("clients_post", payload);

		api.post(clients_path, params, payload, function(err, res) {});
	};

	var update = function(params, payload) {
		logger.log("clients_update", payload);
		
		api.post(clients_path, params, payload, function(err, res) {
			logger.log("clients_post results:", res);
			//  if (err) // schedule?
		});
	};

	return {
		post: post,
		update: update
	};
};