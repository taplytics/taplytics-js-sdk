var should = require.requireActual('should');

jest.dontMock('../../app.js');
jest.dontMock('../init');

describe('Taplytics.init - arguments', function() {
	it("should initialize the SDK with a token", function() {
		var Taplytics = require('../../app.js');

		Taplytics.init("33d4d4330f2a056c1898d7cd1112f63b526c6794", {log_level: 0, env: 'dev'});

		expect(Taplytics).toBeDefined();
		expect(Taplytics).not.toBeNull();
        expect(Taplytics._in.token).toEqual("33d4d4330f2a056c1898d7cd1112f63b526c6794");
	});

	it("should error for an invalid token", function() {
		var Taplytics = require('../../app.js');
        var logger = require('../../lib/logger');

		expect(Taplytics.init(null)).toBeUndefined();

        expect(logger.error).toBeCalled();
	});
});
