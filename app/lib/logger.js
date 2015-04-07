module.exports = {
	log: function(desc, obj) {
		console.log(desc);
		if (obj)
			console.dir(obj);
	},
	error: function(desc, err) {
		console.error(desc);
		
		if (err)
			console.dir(err);
	}
};