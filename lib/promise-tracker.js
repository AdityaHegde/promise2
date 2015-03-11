var Promise = require("promise");

function PromiseTracker() {
  this.que = [];
  this.errorFunctions = [];
  this.runningAsyncCount = 0;
  this.runningNonBlocking = 0;
}

PromiseTracker.prototype.invokeNext = function() {
  if(this.runningAsyncCount === 0 || (this.runningNonBlocking > 0 && this.que[0].type === 1)) {
    var
    last = null,
    tracker = this;
    for(; this.que.length > 0 && (!last || last.type !== 0 && this.que[0].type !== 0); ) {
      (function() {
        var
        process = tracker.que[0],
        promise = process.fn.apply(process.context, process.args);
        tracker.runningNonBlocking += process.type;
        tracker.runningAsyncCount++;
        promise.then(function() {
          tracker.runningNonBlocking -= process.type;
          tracker.runningAsyncCount--;
          process.resolve();
          tracker.invokeNext();
        }, function(err) {
          for(var i = 0; i < tracker.que.length; i++) {
            tracker.que[i].reject(err);
          }
          for(var i = 0; i < tracker.errorFunctions.length; i++) {
            tracker.errorFunctions[i].call(tracker, err);
          }
        });
        last = tracker.que.shift();
      })();
    }
  }
};

PromiseTracker.prototype.addAsync = function(type, args) {
  var
  _args = Array.prototype.slice.call(args),
  fn = _args.shift(),
  context = _args.pop(),
  queObj = {
    fn      : fn,
    context : context,
    args    : _args,
    type    : type,
  },
  promise = new Promise(function(resolve, reject) {
    queObj.resolve = resolve;
    queObj.reject = reject;
  });
  this.que.push(queObj);
  this.invokeNext();
  return promise;
};

PromiseTracker.prototype.addAsyncBlocking = function() {
  return this.addAsync(0, arguments);
};

PromiseTracker.prototype.addAsyncNonBlocking = function() {
  return this.addAsync(1, arguments);
};

PromiseTracker.prototype.wait = function() {
  return this.addAsync(0, [function() {
    return Promise.resolve();
  }, this]);
};

PromiseTracker.prototype.andThen = function(fn) {
  return this.addAsync(0, [function() {
    fn();
    return Promise.resolve();
  }, this]);
};

PromiseTracker.prototype.onError = function(fn) {
  this.errorFunctions.push(fn);
};

module.exports = PromiseTracker;
