"use strict";

function noop() {}
function isObject(x) {
    return x && typeof x === "object";
}
function isFunction(x) {
    return typeof x === "function";
}
function isObjectOrFunction(x) {
    return isObject(x) || isFunction(x);
}

var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";

function $$resolve$$(promise, x) {
    var resolvePromiseCalled = false;
    var rejectPromiseCalled = false;

    if (promise === x) {
        promise._reject(new TypeError("promise and x must not be same object"));
        return;
    }
    if (promise instanceof Promise) {
        // empty
    }
    if (isObjectOrFunction(x)) {
        var then;
        try {
            then = x.then;
        } catch (ex) {
            promise._reject(ex);
            return;
        }
        if (isFunction(then)) {
            try {
                then.call(x, resolvePromise, rejectPromise);
            } catch (ex) {
                if (resolvePromiseCalled || rejectPromiseCalled) {
                    // ignore
                } else {
                    promise._reject(ex);
                }
            }
        } else {
            promise._resolve(x);
        }
    } else {
        promise._resolve(x);
    }

    function resolvePromise(y) {
        if (resolvePromiseCalled || rejectPromiseCalled) return;
        resolvePromiseCalled = true;
        $$resolve$$(promise, y);
    }
    function rejectPromise(reason) {
        if (resolvePromiseCalled || rejectPromiseCalled) return;
        rejectPromiseCalled = true;
        promise._reject(reason);
    }
}

function async(func, thisArg) {
    var callback = func.bind(thisArg);
    return function () {
        setTimeout(callback, 0);
    };
}

function Promise(executor) {
    if (typeof executor !== "function") {
        throw new TypeError("executor must be a function");
    }
    this._state = PENDING;
    this._fulfilledFuns = [];
    this._rejectedFuns = [];
    this._tick = async(this._tick, this);

    async(function () {
        var resolve = this._resolve.bind(this);
        var reject = this._reject.bind(this);
        try {
            executor(resolve, reject);
        } catch (ex) {
            reject(ex);
        }
    }, this)();
}

Promise.prototype._tick = function () {
    switch (this._state) {
        case PENDING:
            return;
        case FULFILLED:
            this._resolveFulfilledFuns();
            break;
        case REJECTED:
            this._resolveRejectedFuns();
            break;
    }
};

Promise.prototype._resolveFulfilledFuns = function () {
    if (this._fulfilledFuns.length === 0) return;
    var onFulfilled;
    while ((onFulfilled = this._fulfilledFuns.shift())) {
        onFulfilled(this._value);
    }
};

Promise.prototype._resolveRejectedFuns = function () {
    if (this._rejectedFuns.length === 0) return;
    var onRejected;
    while ((onRejected = this._rejectedFuns.shift())) {
        onRejected(this._value);
    }
};

Promise.prototype._resolve = function (value) {
    if (this._state !== PENDING) return;
    this._state = FULFILLED;
    this._value = value;
    this._tick();
};

Promise.prototype._reject = function (reason) {
    if (this._state !== PENDING) return;
    this._state = REJECTED;
    this._value = reason;
    this._tick();
};

Promise.prototype._resolving = function (func, nextPromise) {
    var that = this;
    return function _resolve(value) {
        if (!func) {
            if (that._state === FULFILLED) {
                nextPromise._resolve(value);
            } else if (that._state === REJECTED) {
                nextPromise._reject(value);
            }
            return;
        }
        var ret;
        try {
            ret = func(value);
        } catch (ex) {
            nextPromise._reject(ex);
            return;
        }
        $$resolve$$(nextPromise, ret);
    };
};

Promise.prototype.then = function (onFulfilled, onRejected) {
    var promise = new Promise(noop);
    if (typeof onFulfilled === "function") {
        this._fulfilledFuns.push(this._resolving(onFulfilled, promise));
    } else {
        this._fulfilledFuns.push(this._resolving(undefined, promise));
    }
    if (typeof onRejected === "function") {
        this._rejectedFuns.push(this._resolving(onRejected, promise));
    } else {
        this._rejectedFuns.push(this._resolving(undefined, promise));
    }
    this._tick();
    return promise;
};

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

Promise.resolve = function (val) {
    return new Promise(function (resolve) {
        resolve(val);
    });
};

Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    });
};

Promise.all = function (ary) {
    if (ary.length === 0) return Promise.resolve();
    return new Promise(function (resolve, reject) {
        var ret = [];
        var count = 0;
        var rejected = false;
        for (var i = 0, len = ary.length; i < len; i++) {
            ary[0].then(function (val) {
                if (rejected) return;
                ++count;
                ret.push(val);
                if (count === len) {
                    resolve(ret);
                }
            }, function (reason) {
                rejected = true;
                reject(reason);
            });
        }
    });
};

Promise.race = function (ary) {
    if (ary.length === 0) return Promise.resolve();
    return new Promise(function (resolve, reject) {
        var resolved = false;
        var rejected = false;
        for (var i = 0, len = ary.length; i < len; i++) {
            ary[i].then(function (val) {
                if (resolved || rejected) return;
                resolved = true;
                resolve(val);
            }, function (reason) {
                if (resolved || rejected) return;
                rejected = true;
                reject(reason);
            });
        }
    });
};

module.exports = Promise;
