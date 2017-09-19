jest.dontMock('../tlVariable');
jest.dontMock('../../lib/cookies');

var TLVariable = require('../tlVariable');
var Cookies = require('../../lib/cookies');

describe("tlVariable", function() {
    it("should return variable with default value after timeout", function(done) {
        var defaultValue = "default";
        var tlVar = new TLVariable("JS String", defaultValue, function(value) {
            expect(value).toEqual(defaultValue);
            done();
        });
    });

    it("should return variable with default value if cookie.get returns an exception", function(done) {
        Cookies.get = jest.genMockFn();
        Cookies.get.mockImplementation(function() {
            throw new Exception();
        });

        var defaultValue = "default";
        var tlVar = new TLVariable("JS String", defaultValue, function(value) {
            expect(value).toEqual(defaultValue);
            done();
        });
    });
});
