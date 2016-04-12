# promise/A+ implementation

这是一个 promise/A+ 的实现，已通过 promise/A+ 测试。
同时也实现了 ES2015 中的 `Promise.%prototype%.catch`、`Promise.resolve`、`Promise.reject`、`Promise.all`、`Promise.race` 等方法。

实现中使用 `setTimeout` 作为异步 task scheduler。
