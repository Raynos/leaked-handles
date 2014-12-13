var printHandles = require('../print-handles.js');


var test = require('tape');
var setTimeout = require('timers').setTimeout;
var clearTimeout = require('timers').clearTimeout;
var process = require('process');

var FakeLogger = require('./lib/fake-logger.js');

test('leak a timer', function t(assert) {
    var timer = setTimeout(function any() {}, 1000);

    var logger = FakeLogger();
    printHandles(logger);

    assert.ok(logger.contains('no of handles 1'));
    assert.ok(logger.contains(
        'timer handle (`setTimeout(any, 1000)`)'));
    assert.ok(logger.contains('test/leak-timer.js:12:17'))
    assert.ok(logger.contains(
        'timer listener function any() {}'));

    clearTimeout(timer);

    process.nextTick(function () {
        assert.end();
    });
});
