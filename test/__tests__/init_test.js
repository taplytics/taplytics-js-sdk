jest.autoMockOff();
jest.setMock('../../app/app.js', require('../../app/__mocks__/app.js'));
var should = require('should');
describe('Initialization', function() {
	it("should initialize the SDK with a token", function() {
		var Taplytics = require('../../app/app.js');
		Taplytics = Taplytics.init("33d4d4330f2a056c1898d7cd1112f63b526c6794", {log_level: 0, env: 'dev'});
		expect(Taplytics).toBeDefined();
		expect(Taplytics).not.toBeNull();
	});
	it("shouldn't initialize the SDK with an invalid token", function() {
		var Taplytics = require('../../app/app.js');
		expect(Taplytics.init(null)).toBeUndefined();
	});
});

// Some bullshit that should work, see https://github.com/facebook/jest/issues/335:

// var should = require('should');
// describe('Initialization', function() {
//     it("should initialize the SDK with a token", function() {
//         var Taplytics = require('../../app/app.js');
//         console.log("Taplytics is mock from tests: " + Taplytics.isMock);
//         Taplytics = Taplytics.init("33d4d4330f2a056c1898d7cd1112f63b526c6794", {log_level: 0, env: 'dev'});
//         expect(Taplytics).toBeDefined();
//         expect(Taplytics).not.toBeNull();
//     });
//     it("shouldn't initialize the SDK with an invalid token", function() {
//         var Taplytics = require('../../app/app.js');
//         expect(Taplytics.init(null)).toBeUndefined();
//     });
// });
