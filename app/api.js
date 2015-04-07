var base = require('./api/base');
var clients = require('./api/clients')(base);

module.exports = {
	clients: clients
};