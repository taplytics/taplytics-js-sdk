var log = require('../lib/logger');
var session = require('../lib/session');
var variableAPI = require('../api/variable');
var request = require('../api/base');

function TLVariable(name, defaultValue, updatedBlock) {
    this.init = false;
    if (!name) {
        return log.log("Error: Taplytics variable is missing a name", null, log.USER);
    }

    this.name = name;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
    this.updatedBlock = updatedBlock;

    this.defaultType = this.getValueType(defaultValue);
    if (!this.defaultType) {
        return log.log("Error: Taplytics variables only support Strings, Numbers, and Booleans.", null, log.USER);
    }

    this.init = true;
    this.getValueFromConfig();
}

TLVariable.prototype.getValueType = function(value) {
    if (typeof value === "string") {
        return "String";
    } else if (typeof value === "number") {
        return "Number";
    } else if (typeof value === "boolean") {
        return "Boolean";
    } else if (typeof value === "object") {
        return "JSON";
    } else {
        return null;
    }
};

TLVariable.prototype.stringifyValue = function(value) {
    if (this.defaultType === "JSON") {
        return JSON.stringify(value);
    } else {
        return value;
    }
};

TLVariable.prototype.parseValue = function(value) {
    if (this.defaultType === "JSON") {
        if (typeof value === "object") return value;

        try {
            return JSON.parse(value);
        } catch(ex) {
            log.log("Error parsing JSON variable", value, log.LOG);
        }
        return null;
    } else {
        return value;
    }
};

TLVariable.prototype.getValueFromConfig = function() {
    var self = this;

    function callUpdatedBlock() {
        if (self.updatedBlock) {
            self.updatedBlock(self.value);
        }
    }

    // wait for session config data to load from our servers
    session.configPromise(function() {
        var config = session.config;

        // get dynamicVar from config by name
        var dynamicVar = (config && config.dynamicVars) ? config.dynamicVars[self.name] : null;
        if (dynamicVar) {
            // check that the defualt value type is the same as the server type
            if (dynamicVar.variableType !== self.defaultType) {
                callUpdatedBlock();
                return log.error("Taplytics variable " + self.name + " default type does not match server: " + dynamicVar.variableType, null, log.LOG);
            }

            // set variable value, call updated block with new value
            self.value = self.parseValue(dynamicVar.value);
        } else if (config) {
            // upload new variable to server
            log.log("New Taplytics Variable: " + self.name, null, log.DEBUG);
            variableAPI.post(self);
        }

        callUpdatedBlock();
    });
};

module.exports = TLVariable;
