var
assert = require("assert"),
Promise = require("../index").Promise,
PromiseTracker = require("../index").PromiseTracker,

tests = [{
  promises : [0, 0, 0, 0, 0],
  order    : [0, 1, 2, 3, 4],
  title    : "All blocking promises",
}, {
  promises : [1, 1, 1, 1, 1],
  order    : [0, 1, 2, 3, 4],
  title    : "All non blocking promises",
}, {
  promises : [0, 1, 1, 1, 0],
  order    : [0, 1, 2, 3, 4],
  title    : "Mixed : Starting and ending with blocking promises",
}, {
  promises : [1, 1, 1, 1, 0],
  order    : [0, 1, 2, 3, 4],
  title    : "Mixed : Starting with non blocking promises",
}, {
  promises : [0, 1, 1, 1, 1],
  order    : [0, 1, 2, 3, 4],
  title    : "Mixed : Ending with non blocking promises",
}],
functions = ["addAsyncBlocking", "addAsyncNonBlocking"];

describe("No delay tests", function() {
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
              order.push(pi);
              checkOrder();
              resolve();
            });
          }, j, this);
        }
      });
    })();
  }
});
