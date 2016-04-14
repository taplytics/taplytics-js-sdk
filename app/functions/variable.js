var session = require('../lib/session');
var TLVariable = require('../tlVariable/tlVariable');

module.exports = function(name, defaultValue, updatedBlock) {
    var tlVar = new TLVariable(name, defaultValue, updatedBlock);
    return (tlVar && tlVar.init) ? tlVar : null;
};
