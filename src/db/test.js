var Test = (function () {
    function Test() {
    }
    Test.prototype.aaa = function (msg) {
        return Promise.resolve(msg);
    };
    return Test;
}());
var test = new Test();
test.aaa('aaa').then(console.log);
