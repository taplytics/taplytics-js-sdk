var base = require('./api/base');
var users = require('./api/users')(base);

module.exports = {
	users: users
};