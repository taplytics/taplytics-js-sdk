var request = require('superagent');
var config = require('../../config');
var log = require('../lib/logger');
var Queue = require('../lib/queue');
var Qs = require('qs');

var requestsQueue = new Queue();
var isRequesting = false;

var queuedPostRequest = queueRequest(postRequest);
var queuedGetRequest = queueRequest(getRequest);
var queuedDelRequest = queueRequest(deleteRequest);

exports.publicToken = null;
exports.setPublicToken = setPublicToken;
exports.get  = queuedGetRequest;
exports.post = queuedPostRequest;
exports.del  = queuedDelRequest;

//
// Requests
//
function getRequest(path, queryDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum);
    var url = assembleURL(path);
    log.log("GET request: " + url, params, log.LOUD);

    request
        .get(url)
        .query(params.query)
        //.set('Access-Control-Allow-Origin', '*')
        .end(callbackWrapper(url, cb));
}

function postRequest(path, queryDatum, payloadDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum, payloadDatum);
    var url = assembleURL(path);
    log.log("POST request: " + url, params, log.LOUD);

    request
        .post(url)
        .query(params.query)
        .set('Content-Type', 'application/base64+json')
        //.set('Access-Control-Allow-Origin', '*')
        .send(params.payload)
        .end(callbackWrapper(url, cb));
}

function deleteRequest(path, queryDatum, payloadDatum, cb) {
    var params = getRequestQueryAndPayload(queryDatum, payloadDatum);
    var url = assembleURL(path);
    log.log("DELETE request: " + url, params, log.LOUD);

    request
        .del(url)
        .query(params.query)
        .set('Content-Type', 'application/base64+json')
        .send(params.payload)
        .end(callbackWrapper(url, cb));
}


function setPublicToken(token) {
    this.publicToken = token;
}

//
// Processing
//
function callbackWrapper(url, cb) {
    return function(err, res) {
        if (err)
            log.error("Error: " + url, err, log.DEBUG);

        if (cb && typeof cb === 'function')
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

        log.log("Processing request", queueItem, log.DEBUG);
        return queueItem && queueItem.requestFunction && queueItem.requestFunction.apply(exports, queueItem.args);
    } else {
        isRequesting = false;
    }
}

//
// Helper Methods
//
function assembleURL(path, query) {
    return config.obj().baseAPI + (path || '') + queryString(query);
}

function queryString(query) {
    if (!query) return '';

    return "?" + Qs.stringify(query);
}

function getRequestQueryAndPayload(queryDatum, payloadDatum) {
    var query = {};
    var payload = {};

    if (queryDatum && typeof queryDatum == "function")
        query = queryDatum();
    else
        query = queryDatum;

    if (payloadDatum && typeof payloadDatum == "function")
        payload = payloadDatum();
    else
        payload = payloadDatum;

    query.r_v = '1'; // request version

    if (window.btoa && JSON.stringify)
        payload = window.btoa(JSON.stringify(payload));
    else
        query.r_v = '0'; // No btoa support, revert to normal JSON

    if (exports.publicToken)
        query.public_token = exports.publicToken;

    return {
        query: query,
        payload: payload
    };
}
