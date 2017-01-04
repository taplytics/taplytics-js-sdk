jest.dontMock('../../api');
jest.dontMock('../config');

describe("api.config", function() {
    var _ = require('lodash');
    var config;

    beforeEach(function() {
        config = require('../../api/config');
    });

    it("Should test buildConfig distribution", function() {
        var testData = JSON.parse('{"experiments":[{"id":"586bdd6e6e07ee025d3479a1","description":"","project_id":"5730fd66e997c61400cb2d0a","goal_ids":["586bddac6e07ee025d3479c4"],"filters":[{"comparator":"=","type":"osType","_id":"586bdd6e6e07ee025d3479a2","values":["web"]}],"variations":[{"name":"Variation 1","distributionPercent":0.01,"_id":"586bdd6e6e07ee025d3479a3","dynamicVariables":[]},{"name":"Variation 2","distributionPercent":0.01,"_id":"586bdd9e1b978e03122b741a","dynamicVariables":[]}],"baseline":{"distributionPercent":0.98,"dynamicVariables":[],"name":"Baseline"},"updated_at":"2017-01-04T16:39:21.699Z","created_at":"2017-01-03T17:20:46.052Z","name":"dist test","status":"active"}],"variables":[]}');
        var variations = {};
        console.log(JSON.stringify(testData));

        for (var i=0; i < 100000; i++) {
            var data = config.buildConfig(testData);
            if (data) {
                var variationName = data.expVarsNames["dist test"];
                // console.log("Variation selected: " + variationName);
                if (!variations[variationName])
                    variations[variationName] = 1;
                else
                    variations[variationName]++;
            } else {
                console.log("No data built for buildConfig");
            }
        }

        console.log("Variation distribution: ");
        console.dir(variations);
        var total = variations.baseline + variations["Variation 1"] + variations["Variation 2"];
        var var1Per = ((variations["Variation 1"] / total) * 100).toFixed(2);
        var var2Per = ((variations["Variation 1"] / total) * 100).toFixed(2);
        console.log("Total: " + total + ", var1: " + var1Per + "%, var2: " + var2Per + "%");

        expect(var1Per < 1.5, "Variation 1 should be 1%");
        expect(var2Per < 1.5, "Variation 2 should be 1%");
    });
});
