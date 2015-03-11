var
assert = require("assert"),
Promise = require("../index").Promise,
PromiseTracker = require("../index").PromiseTracker;

describe("Misc Tests", function() {
  it("tracker.wait", function(done) {
    var
    orderCheck = [2, 1, 0, 4, 3],
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === orderCheck.length) {
        try {
          assert.deepEqual(order, orderCheck);
          done();
        } catch(err) {
          done(err);
        }
      }
    };
    for(var i = 0; i < 5; i++) {
      (function() {
        var pi = i;
        tracker.addAsyncNonBlocking(function () {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              order.push(pi);
              checkOrder();
              resolve();
            }, 150 - pi * 15);
          });
        });
      })();
      if(i === 2) {
        tracker.wait();
      }
    }
  });

  it("tracker.andThen", function(done) {
    var
    orderCheck = [2, 1, 0, "andThen", 4, 3],
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === orderCheck.length) {
        try {
          assert.deepEqual(order, orderCheck);
          done();
        } catch(err) {
          done(err);
        }
      }
    };
    for(var i = 0; i < 5; i++) {
      (function() {
        var pi = i;
        tracker.addAsyncNonBlocking(function () {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              order.push(pi);
              checkOrder();
              resolve();
            }, 150 - pi * 15);
          });
        });
      })();
      if(i === 2) {
        tracker.andThen(function() {
          order.push("andThen");
        });
      }
    }
  });

  it("Error test", function(done) {
    var
    orderCheck = [4, 3, 2, 1, 0, "Error", "0*", "1*", "2*", "3*", "4*"],
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === orderCheck.length) {
        try {
          assert.deepEqual(order, orderCheck);
          done();
        } catch(err) {
          done(err);
        }
      }
    };

    for(var i = 0; i < 5; i++) {
      (function() {
        var pi = i;
        tracker.addAsyncNonBlocking(function () {
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              order.push(pi);
              checkOrder();
              if(pi === 0) {
                reject();
              }
              else {
                resolve();
              }
            }, 150 - pi * 15);
          });
        });
      })();
    }
    for(var i = 0; i < 5; i++) {
      (function() {
        var pi = i;
        tracker.addAsyncBlocking(function () {
          var p = new Promise(function(resolve, reject) {
            setTimeout(function() {
              order.push(pi);
              checkOrder();
              resolve();
            }, 50);
          });
          return p;
        }).then(function() {}, function() {
          order.push(pi + "*");
          checkOrder();
        });
      })();
    }
    tracker.onError(function() {
      order.push("Error");
      checkOrder();
    });
  });
});
