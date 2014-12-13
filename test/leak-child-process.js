var printHandles = require('../print-handles.js');

var test = require('tape');
var spawn = require('child_process').spawn;

var FakeLogger = require('./lib/fake-logger.js');

test('leak a child process', function t(assert) {
    var proc = spawn('ps', ['aux']);

    process.nextTick(function () {
        var logger = FakeLogger();
        var logs = logger.logs;
        printHandles(logger);

        // assert.ok(logger.contains('no of handles 1'));
        // assert.ok(logger.contains('http handle leaked'));
        // assert.ok(logger.contains('test/leak-http.js:9:20'));
        // assert.ok(logger.contains('host: \'www.google.com\''));
        // assert.ok(logger.contains('fd: ' + req.socket._handle.fd));
        // assert.ok(logger.contains('method: \'GET\''));
        // assert.ok(logger.contains('path: \'/\''));

        proc.kill();

        assert.end();
    });
});
