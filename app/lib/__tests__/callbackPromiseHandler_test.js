jest.dontMock('../callbackPromiseHandler');

var CallbackPromiseHandler = require('../callbackPromiseHandler');

describe("CallbackPromiseHandler", function() {
    it("should push promise into queue", function() {
        var promiseHandler = new CallbackPromiseHandler();
        promiseHandler.push(function() { });
        expect(promiseHandler.promises.length).toEqual(1);
    });

    it("should handle pushing a null promise", function() {
        var promiseHandler = new CallbackPromiseHandler();
        promiseHandler.push(null);
    });

    it("should call all callbacks when completePromises is called", function(done) {
        var promiseHandler = new CallbackPromiseHandler();
        var value = 610;
        promiseHandler.push(null);
        promiseHandler.push(function(returnValue) {
            expect(returnValue).toEqual(value);
            done();
        });
        promiseHandler.push();

        setTimeout(function() {
            promiseHandler.completePromises(value);
        }, 500);
    });

    it("should call all callbacks if completePromises is not called", function(done) {
        var promiseHandler = new CallbackPromiseHandler();
        promiseHandler.push(null);
        promiseHandler.push(function(returnValue) {
            done();
        });
    });
});
