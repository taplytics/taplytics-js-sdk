var logger = require('../lib/logger');
var api = require('../api');

module.exports = function(app) {
    return function(attrs) {
        if (!app.isReady()) {
            logger.error("Taplytics::identify: you have to call Taplytics.init first.", null, logger.USER);
            return false;
        }

        if (!isValidAttrs(attrs)) {
            logger.error("Taplytics::identify: you have to pass in an object with user attributes.", null, logger.USER);

            return false;
        }

        var parsedAttrs = parseAttrs(attrs);

        api.users.createUser(app, parsedAttrs, "Taplytics::identify: failed to save the user attributes properly.");

        return app;
    };
};

// Helpers

function isValidAttrs(attrs) {
    if (!attrs || (attrs && (typeof attrs !== "object")))
        return false;

    return true;
}

function parseAttrs(attrs) {
    var userAttrs = {
        customData: {}
    };

    var attrKeys = Object.keys(attrs);
    var attrIndex = 0;

    for (attrIndex = 0; attrIndex < attrKeys.length; attrIndex++) {
        var key = attrKeys[attrIndex];
        var value = attrs[key];
        var keyInfo = isTopLevelKey(key);

        if (keyInfo && keyInfo.isTopLevel) {
            userAttrs[keyInfo.acceptedKey] = value;
        } else {
            userAttrs.customData[key] = value;
        }
    }

    return userAttrs;
}


// Rather slow implmenetation, but it's fine since the data size is very small
function isTopLevelKey(key) {
    var accepted = {
        'user_id': ['user_id', 'id', 'userID', 'userId', 'customer_id', 'member_id'],
        'email': ['email', 'email_address'],
        'name': ['name'],
        'firstName': ['first_name', 'firstName'],
        'lastName': ['last_name', 'lastName'],
        'avatarUrl': ['avatar', 'avatarUrl'],
        'age': ['age'],
        'gender': ['gender']
    };

    var topLevelKeys = Object.keys(accepted);
    var acceptedIndex = 0;
    var acceptedKeyIndex = 0;

    for (acceptedIndex = 0; acceptedIndex < topLevelKeys.length; acceptedIndex++) {
        var topLevelKey = topLevelKeys[acceptedIndex];
        var acceptedKeys = accepted[topLevelKey];

        if (acceptedKeys) {
            for (acceptedKeyIndex = 0; acceptedKeyIndex < acceptedKeys.length; acceptedKeyIndex++) {
                var acceptedKey = acceptedKeys[acceptedKeyIndex];

                if (acceptedKey && key && acceptedKey == key)
                    return {
                        isTopLevel: true,
                        acceptedKey: acceptedKey
                    };
            }           
        }
    }


    return {
        isTopLevel: false
    };
}
