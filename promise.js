var asap = require('asap');

function Promise(fn, tracker, type) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  var state = null;
  var value = null;
  var deferreds = [];
  var self = this;

  this.then = function(onFulfilled, onRejected) {
    return new self.constructor(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject));
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred);
      return;
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value);
        return;
      }
      var ret;
      try {
        ret = cb(value);
      }
      catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if(tracker) {
        tracker.resolved(self);
      }
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject);
          return;
        }
      }
      state = true;
      value = newValue;
      finale();
    } catch (e) { reject(e) }
  }
  this.resolve = resolve;

  function reject(newValue) {
    state = false;
    value = newValue;
    if(tracker) {
      tracker.rejected();
    }
    finale();
  }
  this.reject = reject;

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i]);
    deferreds = null;
  }

  if(tracker) {
    this.type = type || 0;
    this.resume = function() {
      doResolve(fn, resolve, reject);
    };
    tracker.add(this);
  }
  else {
    doResolve(fn, resolve, reject);
  }
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.resolve = resolve;
  this.reject = reject;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return;
      done = true;
      onFulfilled(value);
    }, function (reason) {
      if (done) return;
      done = true;
      onRejected(reason);
    });
  } catch (ex) {
    if (done) return;
    done = true;
    onRejected(ex);
  }
}

Promise.denodeify = function(fn, argumentCount) {
  argumentCount = argumentCount || Infinity;
  return function () {
    var
    self = this,
    args = Array.prototype.slice.call(arguments),
    tracker = args.shift(),
    type = args.shift();
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop();
      }
      args.push(function (err, res) {
        if (err) reject(err);
        else resolve(res);
      });
      var res = fn.apply(self, args);
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res);
      }
    }, tracker, type);
  };
};

module.exports = Promise;
