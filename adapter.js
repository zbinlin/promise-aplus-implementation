"use strict";

const Promise = require("./promise");
const assert = require("assert");

/**
 * For Promise/A+
 */
exports.deferred = function () {
    return Promise.Deferred();
};
exports.resolved = function (value) {
    return Promise.resolve(value);
};
exports.rejected = function (reason) {
    return Promise.reject(reason);
};

/**
 * For ECMAScript 2015 Promise
 */
exports.defineGlobalPromise = function (globalScope) {
    globalScope.Promise = Promise;
    globalScope.assert = assert;
};
exports.removeGlobalPromise = function (globalScope) {
    delete globalScope.Promise;
};
