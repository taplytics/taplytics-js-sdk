var request = require('./base');
var log = require('../lib/logger');
var session = require('../lib/session');
var events = require('./events');
var _ = require('../lib/tools');

exports.fastMode = false;
exports.startOptions = null;

// switch to get
exports.get = function(skipFastMode) {
    if (!skipFastMode && exports.fastMode && !session.test_experiments)
        return getFastModeConfig();

    var time = new Date();
    var sessionAttrs = buildSessionParams();

    log.log("config_get", sessionAttrs, log.DEBUG);
    request.get("config", sessionAttrs, function(err, response) {
        if (err) {
            log.error("Failed to get config", err, log.DEBUG);
            session.saveSessionConfig(null, true);
        }
        else {
            var data = response.body;
            session.saveSessionConfig(data);
            if (data) {
                events.clientConfig(time);
                log.time("config.get: successfully got session config data", response, time, log.DEBUG);
            } else {
                log.error("No config data in response", null, log.DEBUG);
            }
        }
    });
};

function buildSessionParams() {
    var sessionAttrs = session.getSessionAttributes();
    sessionAttrs.auid = session.getAppUserID();
    if (sessionAttrs.prms)
        sessionAttrs.prms = JSON.stringify(sessionAttrs.prms);
    if (session.test_experiments)
        sessionAttrs.uev = JSON.stringify(session.test_experiments);
    return sessionAttrs;
}

// POST fast mode config to create session
function postFastModeConfig() {
    var time = new Date();
    var sessionAttrs = buildSessionParams();
    var config = session.config
    if (!config) return log.error("Missing config to POST", null, log.DEBUG);

    log.log("config_post", sessionAttrs, log.DEBUG);
    request.post("config", sessionAttrs, config, function(err, response) {
        if (err) {
            log.error("Failed to post config", err, log.DEBUG);
            session.saveSessionConfig(config, true);
        }
        else {
            var data = response.body;
            if (data) {
                config.app_user_id = data.app_user_id;
                config.session_id = data.session_id;
                session.saveSessionConfig(config);

                events.clientConfig(time);
                log.time("config.post: successfully posted session config data", response, time, log.DEBUG);
            } else {
                log.error("No config data in post response", null, log.DEBUG);
                session.saveSessionConfig(config, true);
            }
        }
    });
};

function getFastModeConfig() {
    var time = new Date();
    log.log("get fastMode config", null, log.DEBUG);
    function skipFastMode() {
        log.log("Skipping fast mode, get server config", null, log.DEBUG);
        exports.get(true);
    }

    request.getJSON(request.publicToken + ".json", function(err, response) {
        if (err || !response || !response.body) {
            log.error("Failed to get config", err, log.DEBUG);
            skipFastMode();
        }
        else {
            var data = buildConfig(response.body);

            if (data) {
                session.saveSessionConfig(data);
                log.time("config.get: successfully got fast mode config data", response, time, log.DEBUG);
                events.fastModeConfig(time);
                postFastModeConfig();
            } else {
                log.error("No config data in fast mode response", null, log.DEBUG);
                skipFastMode();
            }
        }
    });
};

function buildConfig(data) {
    var cachedConfig = session.getCachedConfig();
    var expVarsNames = (cachedConfig && cachedConfig.expVarsNames) ? cachedConfig.expVarsNames : {};
    var expVarsIds = {};
    var variables = (cachedConfig && cachedConfig.dynamicVars) ? cachedConfig.dynamicVars : {};

    function addVariables(variables) {
        if (!variables || !variables.length) return;

        for (var i=0; i < variables.length; i++) {
            var variable = variables[i];
            if (variable.isActive) {
                if (!variables[variable.name])
                    variables[variable.name] = variable;
                else
                    log.log("Warning dynamic variable is used in two experiments, name: " + variable.name, null, log.LOG);
            }
        }
    }

    function chooseVariation(exp, variation) {
        expVarsNames[exp.name] = variation.name;
        expVarsIds[exp.id] = variation._id;
        addVariables(variation.dynamicVariables);
    }

    function findVariationId(exp, variationName) {
        if (!variationName) return null;
        if (variationName === "baseline") {
            addVariables(exp.baseline.dynamicVariables);
            return "b";
        }

        for (var i=0; i < exp.variations; i++) {
            var variation = exp.variations[i];
            if (variation && variation.name === variationName) {
                addVariables(variation.dynamicVariables);
                return variation._id;
            }
        }
    }

    if (data.experiments) {
        for (var i=0; i < data.experiments.length; i++) {
            var exp = data.experiments[i];
            var wonVariation = findWinningVariation(exp);
            if (wonVariation) chooseVariation(exp, wonVariation);
            if (expVarsNames[exp.name]) {
                expVarsIds[exp.id] = findVariationId(exp, expVarsNames[exp.name]);
                continue;
            }

            var variation = chooseVariationFromExperiment(exp);
            if (variation) {
                chooseVariation(exp, variation);
            }
            else {
                expVarsNames[exp.name] = "baseline";
                expVarsIds[exp.id] = "b";
                addVariables(exp.baseline.dynamicVariables);
            }
        }
    }

    if (data.variables) {
        for (var i=0; i < data.variables.length; i++) {
            var variable = data.variables[i];
            if (!variable || variables[variable.name]) continue;

            variables[variable.name] = variable;
        }
    }

    return {
        expVarsNames: expVarsNames,
        expVars: expVarsIds,
        dynamicVars: variables
    };
}

function findWinningVariation(exp) {
    if (!exp || !exp.winningVariation_id) return null;

    var wonVariation = null;
    for (var i=0; i < exp.variations.length; i++) {
        var variation = exp.variations[i];
        if (variation && !wonVariation && exp.winningVariation_id === variation._id)
            wonVariation = variation;
    }
    return wonVariation;
}

function chooseVariationFromExperiment(exp) {
    if (exp.variations.length === 0) return null;

    var rand = Math.random();
    var baselinePer = (_.isNumber(exp.baseline.distributionPercent)) ? exp.baseline.distributionPercent : 0;
    var foundVariation = null;

    if (exp.baseline && exp.baseline.distributionPercent
        && rand < exp.baseline.distributionPercent) {
        log.log("Show Baseline For Experiment: " + exp._id, null, log.DEBUG);
        return null;
    }
    else {
        var per = baselinePer;
        for (var i=0; i < exp.variations.length; i++) {
            var variation = exp.variations[i];
            if (variation.distributionPercent && !foundVariation) {
                per += variation.distributionPercent;
                if (rand < per) {
                    log.log("Show Variation: " + variation._id + ", for experiment: " + exp._id, null, log.DEBUG);
                    foundVariation = variation;
                }
            }
        }
        return foundVariation;
    }
}
