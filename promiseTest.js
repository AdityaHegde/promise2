var
Promise = require("./promise"),
ProcessPromiseTracker = require("./tracker"),

nodelikeFun = function(a, c) {
  console.log(a + " beg *");
  setTimeout(function() {
    console.log(a + " end *");
    c(null, a);
  }, 1000);
},
promiseLikFun = Promise.denodeify(nodelikeFun),

tracker = new ProcessPromiseTracker();

new Promise(function(resolve, reject) {
  console.log("1 beg");
  setTimeout(function() {
    console.log("1 end");
    resolve();
  }, 1000);
}, tracker, 0);
new Promise(function(resolve, reject) {
  console.log("2 beg");
  setTimeout(function() {
    console.log("2 end");
    resolve();
  }, 5000);
}, tracker, 1);
new Promise(function(resolve, reject) {
  console.log("3 beg");
  setTimeout(function() {
    console.log("3 end");
    resolve();
  }, 4000);
}, tracker, 1);
new Promise(function(resolve, reject) {
  console.log("4 beg");
  setTimeout(function() {
    console.log("4 end");
    resolve();
  }, 3000);
}, tracker, 1);
new Promise(function(resolve, reject) {
  console.log("5 beg");
  setTimeout(function() {
    console.log("5 end");
    resolve();
  }, 2000);
}, tracker, 1);
new Promise(function(resolve, reject) {
  console.log("6 beg");
  setTimeout(function() {
    console.log("6 end");
    resolve();
  }, 1000);
}, tracker, 0);
promiseLikFun(tracker, 0, 7);
promiseLikFun(tracker, 1, 8);
promiseLikFun(tracker, 1, 9);
promiseLikFun(tracker, 0, 10);
