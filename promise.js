"use strict";

var $$Promise$$ = "__promise__";
var $$Resolve$$ = "__resolve__";
var $$Reject$$ = "__reject__";
var $$PromiseState$$ = "__promise-state__";
var $$PromiseResult$$ = "__promise-result__";
var $$PromiseFulfillReactions$$ = "__promise-fulfill-reactions__";
var $$PromiseRejectReactions$$ = "__promise-reject-reactions__";
var $$PromiseIsHandled$$ = "__promise-is-handled__";
var $$Value$$ = "__value__";
//var $$AlreadyResolved$$ = "__already-resolved__";
var $$Capability$$ = "__capability__";
var $$Capabilities$$ = "__capabilities__";
var $$Handler$$ = "__handler__";
var PENDING = "pending";
var FULFILLED = "fulfilled";
var REJECTED = "rejected";
var IDENTITY = "identity";
var THROWER = "thrower";

function __isConstructor__(C) {
    return __isFunction__(C);
}
function __isCallable__(func) {
    return __isFunction__(func);
}
function __isFunction__(func) {
    return typeof func === "function";
}
function __isObject__(obj) {
    return obj !== null && [
        "undefined",
        "boolean",
        "number",
        "string",
        "symbol",
    ].indexOf(typeof obj) === -1;
}
function __isIterable__(iterable) {
    return typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        && iterable != null && typeof iterable[Symbol.iterator] === "function";
}
function __isPromise__(x) {
    if (!__isObject__(x)) return false;
    if (!($$PromiseState$$ in x)) return false;
    return true;
}
function __Call__(func, thisArg, args) {
    return func.apply(thisArg, args);
}

function __GetSpecies(C) {
    if (typeof Symbol === "function" && typeof Symbol.species === "symbol") {
        return C[Symbol.species];
    }
    return C["@@species"];
}

function __SpeciesConstructor__(O, defaultConstructor) {
    if (!__isObject__(O)) {
        throw new TypeError;
    }
    var C = O.constructor;
    if (C === undefined) {
        return defaultConstructor;
    }
    if (!__isObject__(C)) {
        throw new TypeError;
    }
    var S = __GetSpecies(C);
    if (S == null) {
        return defaultConstructor;
    }
    if (__isConstructor__(S)) {
        return S;
    }
    throw new TypeError;
}

function __SetInternalSlot__(obj, key, val) {
    try {
        Object.defineProperty(obj, key, {
            value: val,
            writable: true,
        });
    } catch (ex) {
        obj[key] = val;
    }
}

function __EnqueueJob__(queueName, job, args) {
    setTimeout(function () {
        job.apply(undefined, args);
    });
}

function __HostPromiseRejectionTracker__(promise, operation) {
    // empty
}

function __GetCapabilitiesExecutor__() {
    return function F(resolve, reject) {
        var promiseCapability = F[$$Capability$$];
        if (promiseCapability[$$Resolve$$] !== undefined) {
            throw new TypeError;
        }
        if (promiseCapability[$$Reject$$] !== undefined) {
            throw new TypeError;
        }
        promiseCapability[$$Resolve$$] = resolve;
        promiseCapability[$$Reject$$] = reject;
    };
}

function __NewPromiseCapability__(C) {
    if (!__isConstructor__(C)) {
        throw new TypeError;
    }
    var promiseCapability = {};
    promiseCapability[$$Promise$$] = undefined;
    promiseCapability[$$Resolve$$] = undefined;
    promiseCapability[$$Reject$$] = undefined;
    var executor = __GetCapabilitiesExecutor__();
    __SetInternalSlot__(executor, $$Capability$$, promiseCapability);
    var promise = new C(executor);
    if (!__isCallable__(promiseCapability[$$Resolve$$])) {
        throw new TypeError;
    }
    if (!__isCallable__(promiseCapability[$$Reject$$])) {
        throw new TypeError;
    }
    promiseCapability[$$Promise$$] = promise;
    return promiseCapability;
}

function __PromiseReactionJob__(reaction, argument) {
    var promiseCapability = reaction[$$Capabilities$$];
    var handler = reaction[$$Handler$$];
    if (handler === IDENTITY) {
        return __Call__(promiseCapability[$$Resolve$$], undefined, [argument]);
    } else if (handler === THROWER) {
        return __Call__(promiseCapability[$$Reject$$], undefined, [argument]);
    } else {
        try {
            var handlerResult = __Call__(handler, undefined, [argument]);
        } catch (ex) {
            return __Call__(promiseCapability[$$Reject$$], undefined, [ex]);
        }
        return __Call__(promiseCapability[$$Resolve$$], undefined, [handlerResult]);
    }
}

function __PromiseResolveThenableJob__(promiseToResolve, thenable, then) {
    var resolvingFunctions = __CreateResolvingFunctions__(promiseToResolve);
    try {
        var thenCallResult = __Call__(then, thenable, [
            resolvingFunctions[$$Resolve$$],
            resolvingFunctions[$$Reject$$],
        ]);
    } catch (ex) {
        return __Call__(resolvingFunctions[$$Reject$$], undefined, [ex]);
    }
    return thenCallResult;
}

function __TriggerPromiseReactions__(reactions, argument) {
    for (var i = 0, len = reactions.length; i < len; i++) {
        __EnqueueJob__("PromiseJobs", __PromiseReactionJob__, [
            reactions[i], argument,
        ]);
    }
}

function __FulfillPromise__(promise, value) {
    var reactions = promise[$$PromiseFulfillReactions$$];
    promise[$$PromiseResult$$] = value;
    promise[$$PromiseFulfillReactions$$] = undefined;
    promise[$$PromiseRejectReactions$$] = undefined;
    promise[$$PromiseState$$] = FULFILLED;
    return __TriggerPromiseReactions__(reactions, value);
}

function __RejectPromise__(promise, reason) {
    var reactions = promise[$$PromiseRejectReactions$$];
    promise[$$PromiseResult$$] = reason;
    promise[$$PromiseFulfillReactions$$] = undefined;
    promise[$$PromiseRejectReactions$$] = undefined;
    promise[$$PromiseState$$] = REJECTED;
    if (!promise[$$PromiseIsHandled$$]) {
        __HostPromiseRejectionTracker__(promise, "reject");
    }
    return __TriggerPromiseReactions__(reactions, reason);
}

function __CreateResolveFunctions__(promise, alreadyResolved) {
    return function F(resolution) {
        if (alreadyResolved[$$Value$$] === true) {
            return;
        }
        alreadyResolved[$$Value$$] = true;
        if (resolution === promise) {
            return __RejectPromise__(promise, new TypeError);
        }
        if (!__isObject__(resolution)) {
            return __FulfillPromise__(promise, resolution);
        }
        try {
            var then = resolution.then;
        } catch (ex) {
            return __RejectPromise__(promise, ex);
        }
        if (!__isCallable__(then)) {
            return __FulfillPromise__(promise, resolution);
        }
        __EnqueueJob__("PromiseJobs", __PromiseResolveThenableJob__, [
            promise, resolution, then,
        ]);
    };
}

function __CreateRejectFunctions__(promise, alreadyResolved) {
    return function F(reason) {
        if (alreadyResolved[$$Value$$] === true) {
            return;
        }
        alreadyResolved[$$Value$$] = true;
        return __RejectPromise__(promise, reason);
    };
}

function __CreateResolvingFunctions__(promise) {
    var alreadyResolved = {};
    alreadyResolved[$$Value$$] = false;
    var resolve = __CreateResolveFunctions__(promise, alreadyResolved);
    var reject = __CreateRejectFunctions__(promise, alreadyResolved);
    var ret = {};
    ret[$$Resolve$$] = resolve;
    ret[$$Reject$$] = reject;
    return ret;
}

function __PerformPromiseThen__(promise, onFulfilled, onRejected, resultCapability) {
    if (!__isCallable__(onFulfilled)) {
        onFulfilled = IDENTITY;
    }
    if (!__isCallable__(onRejected)) {
        onRejected = THROWER;
    }
    var fulfillReaction = {};
    fulfillReaction[$$Capabilities$$] = resultCapability;
    fulfillReaction[$$Handler$$] = onFulfilled;

    var rejectReaction = {};
    rejectReaction[$$Capabilities$$] = resultCapability;
    rejectReaction[$$Handler$$] = onRejected;

    if (promise[$$PromiseState$$] === PENDING) {
        promise[$$PromiseFulfillReactions$$].push(fulfillReaction);
        promise[$$PromiseRejectReactions$$].push(rejectReaction);
    } else if (promise[$$PromiseState$$] === FULFILLED) {
        var value = promise[$$PromiseResult$$];
        __EnqueueJob__("PromiseJobs", __PromiseReactionJob__, [
            fulfillReaction, value,
        ]);
    } else {
        var reason = promise[$$PromiseResult$$];
        if (promise[$$PromiseIsHandled$$] === false) {
            __HostPromiseRejectionTracker__(promise, "handle");
        }
        __EnqueueJob__("PromiseJobs", __PromiseReactionJob__, [
            rejectReaction, reason,
        ]);
    }
    promise[$$PromiseIsHandled$$] = true;
    return resultCapability[$$Promise$$];
}

function Promise(executor) {
    if (!(this instanceof Promise)) {
        throw new TypeError;
    }
    if (!__isCallable__(executor)) {
        throw new TypeError;
    }
    if (this[$$PromiseState$$]) {
        throw new TypeError;
    }
    __SetInternalSlot__(this, $$PromiseState$$, PENDING);
    __SetInternalSlot__(this, $$PromiseFulfillReactions$$, []);
    __SetInternalSlot__(this, $$PromiseRejectReactions$$, []);
    __SetInternalSlot__(this, $$PromiseIsHandled$$, false);

    var resolvingFunctions = __CreateResolvingFunctions__(this);
    try {
        __Call__(executor, undefined, [
            resolvingFunctions[$$Resolve$$],
            resolvingFunctions[$$Reject$$],
        ]);
    } catch (ex) {
        __Call__(resolvingFunctions[$$Reject$$], undefined, [ex]);
    }
    return this;
}

var descriptor = Object.getOwnPropertyDescriptor(Promise, "prototype");
descriptor.writable = false;
Object.defineProperty(Promise, "prototype", descriptor);
Object.defineProperty(Promise.prototype, "@@toStringTag", {
    value: Promise,
    writable: false,
    enumerable: false,
    configuable: true,
});
Object.defineProperty(Promise, "@@species", {
    get: function () {
        return this;
    },
});

Promise.prototype["catch"] = function __promise_catch__(onRejected) {
    return this.then(undefined, onRejected);
};
Promise.prototype.then = function __promise_then__(onFulfilled, onRejected) {
    if (!__isPromise__(this)) {
        throw new TypeError;
    }
    var promise = this;
    var C = __SpeciesConstructor__(promise, Promise);
    var resultCapability = __NewPromiseCapability__(C);
    return __PerformPromiseThen__(promise, onFulfilled, onRejected, resultCapability);
};

Promise.resolve = function __promise_resolve__(x) {
    var C = this;
    if (!__isObject__(C)) {
        throw new TypeError;
    }
    if (__isPromise__(x)) {
        var constructor = Object.getPrototypeOf(x).constructor;
        if (constructor === C) {
            return x;
        }
    }
    var promiseCapability = __NewPromiseCapability__(C);
    __Call__(promiseCapability[$$Resolve$$], undefined, [x]);
    return promiseCapability[$$Promise$$];
};

Promise.reject = function __promise_reject__(r) {
    var C = this;
    if (!__isObject__(C)) {
        throw new TypeError;
    }
    var promiseCapability = __NewPromiseCapability__(C);
    __Call__(promiseCapability[$$Reject$$], undefined, [r]);
    return promiseCapability[$$Promise$$];
};

Promise.all = function __promise_all__(iterable) {
    var C = this;
    if (!__isObject__(C)) {
        throw new TypeError;
    }
    var promiseCapability = __NewPromiseCapability__(C);
    var values = [];
    var remainingElementsCount;
    if (Array.isArray(iterable)) {
        remainingElementsCount = iterable.length;
        if (remainingElementsCount === 0) {
            __Call__(promiseCapability[$$Resolve$$], undefined, [values]);
            return promiseCapability[$$Promise$$];
        }
        for (var i = 0, len = remainingElementsCount; i < len; i++) {
            resolve(iterable[i]);
        }
    } else if (__isIterable__(iterable)) {
        remainingElementsCount = 0;
        var iterator;
        try {
            iterator = iterable[Symbol.iterator]();
        } catch (ex) {
            __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
            return promiseCapability[$$Promise$$];
        }
        while (true) { /* eslint no-constant-condition: 0 */
            var next;
            try {
                next = iterator.next();
            } catch (ex) {
                __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
                return promiseCapability[$$Promise$$];
            }
            if (!next || next.done) {
                if (remainingElementsCount === 0) {
                    __Call__(promiseCapability[$$Resolve$$], undefined, [values]);
                }
                break;
            }
            resolve(next.value);
            remainingElementsCount += 1;
        }
    } else {
        __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
    }
    return promiseCapability[$$Promise$$];

    function resolve(val) {
        var nextPromise = C.resolve(val);
        nextPromise.then(resolveElement, promiseCapability[$$Reject$$]);
    }
    function resolveElement(val) {
        values.push(val);
        remainingElementsCount -= 1;
        if (remainingElementsCount === 0) {
            __Call__(promiseCapability[$$Resolve$$], undefined, [values]);
        }
    }
};

Promise.race = function __promise_race__(iterable) {
    var C = this;
    if (!__isObject__(C)) {
        throw new TypeError;
    }
    var promiseCapability = __NewPromiseCapability__(C);
    if (Array.isArray(iterable)) {
        for (var i = 0, len = iterable.length; i < len; i++) {
            resolve(iterable[i]);
        }
    } else if (__isIterable__(iterable)) {
        var iterator;
        try {
            iterator = iterable[Symbol.iterator]();
        } catch (ex) {
            __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
            return promiseCapability[$$Promise$$];
        }
        while (true) { /* eslint no-constant-condition: 0 */
            var next;
            try {
                next = iterator.next();
            } catch (ex) {
                __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
                return promiseCapability[$$Promise$$];
            }
            if (!next || next.done) {
                break;
            }
            resolve(next.value);
        }
    } else {
        __Call__(promiseCapability[$$Reject$$], undefined, [new TypeError]);
    }
    return promiseCapability[$$Promise$$];

    function resolve(val) {
        var nextPromise = C.resolve(val);
        nextPromise.then(promiseCapability[$$Resolve$$], promiseCapability[$$Reject$$]);
    }
};

Promise.Deferred = function () {
    var promiseCapability = __NewPromiseCapability__(this);
    return {
        promise: promiseCapability[$$Promise$$],
        resolve: promiseCapability[$$Resolve$$],
        reject: promiseCapability[$$Reject$$],
    };
};

module.exports = Promise;
