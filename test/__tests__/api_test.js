jest.autoMockOff();
jest.setMock('../../app/app.js', require('../../app/__mocks__/app.js'));
var should = require('should');
var users = require.requireActual('../../app/api/users');
var Cookies = require.requireActual('cookies-js');

describe("App Users", function() {
    it("should post a user's attributes", function(done) {
        var Taplytics = require('../helpers/initialized_app');
        Cookies.set('_tl_auid_' + Taplytics.token, '5510b31db91b0b67f8cc139e');
        var user_attrs = {
            gender: "xe"
        };
        // users.post(Taplytics, user_attrs, "fail", function(err, response){
        //     done(err);
        // });
    });
});