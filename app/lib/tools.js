exports.isNumber = function(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L9098
    var numberTag = '[object Number]';
    var objToString = Object.prototype.toString;

    return typeof value == 'number' || (exports.isObjectLike(value) && objToString.call(value) == numberTag);
};

exports.isObjectLike = function(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L569
    return !!value && typeof value == 'object';
};
