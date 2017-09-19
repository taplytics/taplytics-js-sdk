var log = require('../lib/logger');
var session = require('../lib/session');
var variableAPI = require('../api/variable');

module.exports = function(name, codeBlock) {
    if (!name) return log.error("No name to run code block", null, log.USER);

    // wait for session config data to load from our servers
    session.configPromise(function() {
        var config = session.config;
        if (!config) return;

        // get dynamicVar from config by name
        var dynamicVar = config.dynamicVars ? config.dynamicVars[name] : null;
        if (dynamicVar) {
            // check that the defualt value type is the same as the server type
            if (dynamicVar.variableType !== "Code Block")
                return log.error("Taplytics code block " + name + " default type does not match server: " + dynamicVar.variableType, null, log.LOG);

            // call codeBlock
            if (codeBlock && dynamicVar.value) {
                codeBlock();
            }
        } else {
            // upload new variable to server
            log.log("New Taplytics Code Block: " + name, null, log.DEBUG);
            variableAPI.post({
                name: name,
                defaultType: "Code Block",
                defaultValue: false
            });
        }
    });
};
