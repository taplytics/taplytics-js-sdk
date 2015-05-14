module.exports = function(object, func, new_func, context) {
    // Make sure new_func is called before (with `context`) object[func] and make sure to call object[func] with `context`

    if (!object)
        return false;

    if (!func || typeof func !== "string")
        return false;

    if (!new_func || typeof new_func !== "function")
        return false;

    if (!object[func])
        return false;

    var originalFunc = object[func];

    (function(cntx) {
        object[func] = function() {
            new_func.apply(cntx, arguments);
            originalFunc.apply(cntx, arguments); 
        };
    })(context);

    return true;
};