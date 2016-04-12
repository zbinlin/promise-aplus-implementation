"use strict";

const Promise = require("./promise");

function noop() {
}

function deferred() {
    var promise = new Promise(noop);
    return {
        promise,
        resolve:  function resolve(value) {
            promise._resolve(value);
        },
        reject: function reject(reason) {
            promise._reject(reason);
        },
    };
}

module.exports.deferred = deferred;
module.exports.resolved = function (value) {
    return Promise.resolve(value);
};
module.exports.rejected = function (reason) {
    return Promise.reject(reason);
};

