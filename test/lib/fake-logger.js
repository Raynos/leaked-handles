var util = require('util');

module.exports = FakeLogger;

function FakeLogger() {
    var logs = [];

    return {
        log: function () {
            logs.push(util.format.apply(util, arguments));

            if (process.env.DEBUG) {
                console.log(logs[logs.length - 1]);
            }
        },
        contains: function (str) {
            var content = logs.join('\n');

            return content.indexOf(str) > -1;
        }
    };
}
