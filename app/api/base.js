var request = require('superagent');
var config = require('../../config');
var logger = require('../lib/logger');
var Queue = require('../lib/queue');
var Qs = require('qs');


exports.get  = queueRequest(getRequest);
exports.post = queueRequest(postRequest);

var requestsQueue = new Queue();
var isRequesting = false;

// Requests
function getRequest(path, queryDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum); 
    var url = assembleURL(path, params.query);

    request.get(url, callbackWrapper(url, cb));
}

function postRequest(path, queryDatum, payloadDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum, payloadDatum);   
    var url = assembleURL(path, params.query);

    request.post(url, params.payload, callbackWrapper(url, cb));
}

// Processing

function callbackWrapper(url, cb) {
    return function(err, res) {
        if (err)
            logger.error("Error: " + url, err);

        if (cb)
            cb(err, res);

        processQueue();
    };
}

function queueRequest(requestFunction) {
    return function() {
        requestsQueue.enqueue({
            requestFunction: requestFunction,
            args: arguments
        });

        if (!isRequesting)
            processQueue();
    };
}

function processQueue() {
    if (!requestsQueue.isEmpty()) {
        isRequesting = true;

        var queueItem = requestsQueue.dequeue();

        logger.log("Processing request", queueItem, logger.DEBUG);
        return queueItem && queueItem.requestFunction && queueItem.requestFunction.apply(undefined, queueItem.args);
    } else {
        isRequesting = false;
    }
}

// Helper Methods

function assembleURL(path, query) {
    return config.baseAPI + (path || '') + queryString(query);
}

function queryString(query) {
    if (!query) return '';

    return "?" + Qs.stringify(query);
}

function getRequestQueryAndPayload(queryDatum, payloadDatum) {
    var query = null;
    var payload = null;

    if (queryDatum && typeof queryDatum == "function")
        query = queryDatum();
    else
        query = queryDatum;

    if (payloadDatum && typeof payloadDatum == "function")
        payload = payloadDatum();
    else
        payload = payloadDatum;

    return {
        query: query,
        payload: payload
    };
}
