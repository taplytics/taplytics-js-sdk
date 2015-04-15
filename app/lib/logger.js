var priority_level = 0; // 2: debug, 1: log, 0: quiet (big error only)

function isLoggerEnabled(level) {
    return priority_level >= level;
}

module.exports = {
    DEBUG: 2,
    LOG: 1,
    USER: 0,
    setPriorityLevel: function(priority) {
        priority_level = priority;
    },
    log: function(desc, obj, level) {
        if (level !== undefined && !isLoggerEnabled(level))
            return;
        
        console.log(desc);
        
        if (obj)
            console.dir(obj);
    },
    error: function(desc, err, level) {
        if (level !== undefined && !isLoggerEnabled(level))
            return;

        console.error(desc);
        
        if (err)
            console.dir(err);
    }
};