var priority_level = 0; // 3: extra debug, 2: debug, 1: log, 0: quiet (big errors / issues only)

function isLoggerEnabled(level) {
    return priority_level >= level;
}

exports.LOUD = 3;
exports.DEBUG = 2;
exports.LOG = 1;
exports.USER = 0;

exports.setPriorityLevel = function(priority) {
    priority_level = priority;
};
  
exports.log = function(desc, obj, level) {
    if (level !== undefined && !isLoggerEnabled(level))
        return;
    
    console.log("[Taplytics]", desc);
    
    if (obj)
        console.dir(obj);
};

exports.error = function(desc, err, level) {
    if (level !== undefined && !isLoggerEnabled(level))
        return;

    console.error("[Taplytics]", desc);
    
    if (err)
        console.dir(err);
};
