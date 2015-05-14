// This file essentially creates a dependency for all our tests for the Taplytics init function
// Therefore, if that function breaks, all of our tests break.
// This is probably better than making a brittle and fragile mock
// jest.autoMockOff();

jest.dontMock('../../app/app.js');
jest.dontMock('../../app/functions/init.js');
jest.dontMock('../../app/functions/isReady.js');

module.exports = function() {
    var app = require('../../app/app.js');
    app = app.init("33d4d4330f2a056c1898d7cd1112f63b526c6794", {log_level: 0, env: 'dev'});
    return app;
}();
