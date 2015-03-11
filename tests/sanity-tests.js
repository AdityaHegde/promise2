var
assert = require("assert"),
Promise = require("../index").Promise,
PromiseTracker = require("../index").PromiseTracker,

tests = [{
  promises : [0, 0, 0, 0, 0],
  timeFun  : function(idx) {
    return 100;
  },
  order    : [0, 1, 2, 3, 4],
  title    : "All blocking promises",
}, {
  promises : [1, 1, 1, 1, 1],
  timeFun  : function(idx) {
    return 150 - idx * 20;
  },
  order    : [4, 3, 2, 1, 0],
  title    : "All non blocking promises",
}, {
  promises : [0, 1, 1, 1, 0],
  timeFun  : function(idx) {
    return 150 - idx * 20;
  },
  order    : [0, 3, 2, 1, 4],
  title    : "Mixed : Starting and ending with blocking promises",
}, {
  promises : [1, 1, 1, 1, 0],
  timeFun  : function(idx) {
    return 150 - idx * 20;
  },
  order    : [3, 2, 1, 0, 4],
  title    : "Mixed : Starting with non blocking promises",
}, {
  promises : [0, 1, 1, 1, 1],
  timeFun  : function(idx) {
    return 150 - idx * 20;
  },
  order    : [0, 4, 3, 2, 1],
  title    : "Mixed : Ending with non blocking promises",
}],
functions = ["addAsyncBlocking", "addAsyncNonBlocking"];

describe("Sanity Tests", function() {
  for(var i = 0; i < tests.length; i++) {
    (function() {
      var
      test = tests[i];
      it(test.title, function(done) {
        var
        tracker = new PromiseTracker(),
        order = [],
        checkOrder = function() {
          if(order.length === test.promises.length) {
            try {
              assert.deepEqual(order, test.order);
              done();
            } catch(err) {
              done(err);
            }
          }
        };

        for(var j = 0; j < test.promises.length; j++) {
          tracker[functions[test.promises[j]]](function (pi) {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                order.push(pi);
                checkOrder();
                resolve();
              }, test.timeFun(pi));
            });
          }, j, this);
        }
      });
    })();
  }
});
