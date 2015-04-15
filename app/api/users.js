var users_path = 'users';
var logger = require('../lib/logger');

module.exports = function(api) {

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
		post: post,
		update: update
	};
};