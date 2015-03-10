function PromiseTracker() {
  this.que = [];
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
          tracker.invokeNext();
        }, function(err) {
          for(var i = 0; i < tracker.que.length; i++) {
            tracker.que[i].reject(err);
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
  context = _args.pop();
  this.que.push({
    fn      : fn,
    context : context,
    args    : _args,
    type    : type,
  });
  this.invokeNext();
};

PromiseTracker.prototype.addAsyncBlocking = function() {
  this.addAsync(0, arguments);
};

PromiseTracker.prototype.addAsyncNonBlocking = function() {
  this.addAsync(1, arguments);
};

PromiseTracker.prototype.wait = function() {
  this.addAsync(0, [function() {}, this]);
};

PromiseTracker.prototype.andThen = function() {
  this.addAsync(0, arguments);
};

module.exports = PromiseTracker;
