var log = require('../lib/logger');
var session = require('../lib/session');
var variableAPI = require('../api/variable');

function TLVariable(name, defaultValue, updatedBlock) {
    this.init = false;
    if (!name)
        return log.log("Error: Taplytics variable is missing a name", null, log.USER);

    this.name = name;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
    this.updatedBlock = updatedBlock;

    this.defaultType = this.getValueType(defaultValue);
    if (!this.defaultType)
        return log.log("Error: Taplytics variables only support Strings, Numbers, and Booleans.", null, log.USER);

    this.init = true;
    this.getValueFromConfig();
}

TLVariable.prototype.getValueType = function(value) {
    if (typeof value === "string")
        return "String";
    else if (typeof value === "number")
        return "Number";
    else if (typeof value === "boolean")
        return "Boolean";
    else
        return null;
};

TLVariable.prototype.getValueFromConfig = function() {
    var self = this;

    // wait for session config data to load from our servers
    session.sessionConfigPromise(function() {
        var config = session.config;
        if (!config) return;

        // get dynamicVar from config by name
        var dynamicVar = config.dynamicVars ? config.dynamicVars[self.name] : null;
        if (dynamicVar) {
            // check that the defualt value type is the same as the server type
            if (dynamicVar.variableType !== self.defaultType)
                return log.error("Taplytics variable " + self.name + " default type does not match server: " + dynamicVar.variableType, null, log.LOG);

            // set variable value, call updated block with new value
            self.value = dynamicVar.value;
            if (self.updatedBlock)
                self.updatedBlock(self.value);
        }
        else {
            // upload new variable to server
            log.log("New Taplytics Variable: " + self.name, null, log.DEBUG);
            variableAPI.post(self);
        }
    });
};

module.exports = TLVariable;
