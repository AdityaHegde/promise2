function ProcessPromiseTracker() {
  this.que = [];
  this.runningBlockingAsync = null;
  this.curNonBlockingAsyncPromisesCount = 0;
}

function unwindQue(tracker) {
  var last = null;
  for(; tracker.que.length > 0 && (!last || (last.type !== 0 && tracker.que[0].type !== 0));) {
    if(tracker.que[0].type === 1) {
      tracker.curNonBlockingAsyncPromisesCount++;
      tracker.runningBlockingAsync = false;
    }
    else {
      tracker.runningBlockingAsync = true;
    }
    tracker.que[0].resume();
    last = tracker.que.shift();
  }
}
function invokeNextPromise(tracker) {
  if(tracker.runningBlockingAsync === null) {
    //console.log("nothing running. resuming front");
    unwindQue(tracker);
  }
  else if(!tracker.runningBlockingAsync) {
    //console.log("async non blocking running");
    if(tracker.que[0].type === 1) {
      //console.log("resuming non blocking from front");
      unwindQue(tracker);
    }
  }
  else {
    //console.log("async blocking running.");
  }
}

ProcessPromiseTracker.prototype.add = function(promise) {
  this.que.push(promise);
  if(promise.type === 0) {
    //blocking async promise
  }
  else if(promise.type === 1) {
    //non blocking async promise
  }
  invokeNextPromise(this);
};
ProcessPromiseTracker.prototype.resolved = function(promise) {
  if(promise.type === 0) {
    //blocking async promise
    this.runningBlockingAsync = null;
  }
  else if(promise.type === 1) {
    //non blocking async promise
    this.curNonBlockingAsyncPromisesCount--;
    if(this.curNonBlockingAsyncPromisesCount === 0) {
      this.runningBlockingAsync = null;
    }
  }
  invokeNextPromise(this);
};
ProcessPromiseTracker.prototype.rejected = function() {
  for(var i = 0; i < this.que.length; i++) {
    this.que[i].reject();
  }
};

module.exports = ProcessPromiseTracker;
