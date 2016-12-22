var objToString = Object.prototype.toString;
var numberTag = '[object Number]';
var stringTag = '[object String]';

exports.isNumber = function(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L9098
    return typeof value == 'number' || (exports.isObjectLike(value) && objToString.call(value) == numberTag);
};

exports.isString = function(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L9180
    return typeof value == 'string' || (exports.isObjectLike(value) && objToString.call(value) == stringTag);
}

exports.isObjectLike = function(value) { // https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js#L569
    return !!value && typeof value == 'object';
};
