jest.dontMock('../cookies');

var should = require('should');
var Cookies = require('../cookies');

var testDomains = {
    'vn.search.yahoo.com.vn': '.yahoo.com.vn',
    'search.yahoo.com': '.yahoo.com',
    'yahoo.com.br': '.yahoo.com.br',
    'abc.porto.pt': '.porto.pt',
    'ccc.abc.cn': '.abc.cn',
    'dorgas.com': '.dorgas.com',
    'www.cn.com': '.cn.com',
    'abc.iu.uk': '.iu.uk',
    'asia.com': '.asia.com',
    'br.asia': '.br.asia',
    'asia.com.br': '.asia.com.br',
    'dev.taplytics.com': '.taplytics.com',
    'www.taplytics.com': '.taplytics.com',
    'taplytics.com': '.taplytics.com',
    'dev.taplytics.co.ca': '.taplytics.co.ca'
};

describe("cookies", function() {
    describe("getCookieDomain", function() {
        it("should return proper cookie domain for all test domains", function() {
            var keys = Object.keys(testDomains);
            for (var i=0; i < keys.length; i++) {
                var testDomain = keys[i];
                var testDomainResult = testDomains[testDomain];
                Object.defineProperty(window.location, 'hostname', {
                  writable: true,
                  value: testDomain
                });

                var cookieDomain = Cookies.getCookieDomain();
                expect(cookieDomain).toEqual(testDomainResult);
            }
        });
    });
});
