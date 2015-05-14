var config = require('./');
var path = require('path');

module.exports = {
  root: path.normalize(config.destDirectory),
  port: process.env.PORT || 5000,
  logLevel: process.env.NODE_ENV ? 'combined' : 'dev',
  staticOptions: {
    extensions: ['html'],
    maxAge: '31556926'
  }
};
