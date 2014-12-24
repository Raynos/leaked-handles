var printHandles = require('../print-handles.js');

var test = require('tape');
var spawn = require('child_process').spawn;
var process = require('process');

var FakeLogger = require('./lib/fake-logger.js');

test('leak a child process', function t(assert) {
    var proc = spawn('ps', ['aux']);

    process.nextTick(function () {
        var logger = FakeLogger();
        printHandles(logger);

        assert.ok(logger.contains('no of handles 4'));
        assert.ok(logger.contains(
            'child process handle leaked'));
        assert.ok(logger.contains(
            'test/leak-child-process.js:10:16'));
        assert.ok(logger.contains('cmd: \'ps\''));
        assert.ok(logger.contains('args: [ \'aux\' ]'));

        assert.ok(logger.contains(
            'child process stdout stream handle leaked'));
        assert.ok(logger.contains(
            'child process stdin stream handle leaked'));
        assert.ok(logger.contains(
            'child process stderr stream handle leaked'));

        proc.kill();

        proc.once('close', assert.end);
    });
});
