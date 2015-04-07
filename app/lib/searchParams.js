var Qs = require('qs');

module.exports = function() {
	if (!location.search || (location.search && !location.search.length))
		return {};
	
	var searchParams = Qs.parse(location.search.substr(1));

	return searchParams;
};