jest.dontMock('../../app/app');
jest.dontMock('../../app/functions/isReady');

module.exports = function() {
    var app = require('../../app/app.js');

    return app;
}();
