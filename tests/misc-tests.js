var
assert = require("assert"),
Promise = require("../index").Promise,
PromiseTracker = require("../index").PromiseTracker;

describe("Misc Tests", function() {
  it("tracker.wait", function() {
    var
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === 5) {
        assert.deepEqual(order, [2, 1, 0, 4, 3]);
        done();
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

  it("tracker.andThen", function() {
    var
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === 5) {
        assert.deepEqual(order, [2, 1, 0, "andThen", 4, 3]);
        done();
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

  it("Error test", function() {
    var
    tracker = new PromiseTracker(),
    order = [],
    checkOrder = function() {
      if(order.length === 5) {
        assert.deepEqual(order, [2, 1, 0, 3, 4]);
        done();
      }
    };

    for(var i = 0; i < 5; i++) {
      (function() {
        var pi = i;
        tracker.addAsyncNonBlocking(function () {
          var p = new Promise(function(resolve, reject) {
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
          p.then(function() {
          }, function() {
            order.push(pi + "*");
            checkOrder();
            resolve();
          });
          return p;
        });
      })();
      if(i === 2) {
        tracker.andThen(function() {
          order.push("andThen");
        });
      }
    }
  });
});
