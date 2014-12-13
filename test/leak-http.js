var printHandles = require('../print-handles.js');

var test = require('tape');
var http = require('http');

var FakeLogger = require('./lib/fake-logger.js');

test('leak a http request', function t(assert) {
    var req = http.request({
        hostname: 'www.google.com',
        port: 80,
        method: 'GET'
    }, function onResponse(resp) {
        var logger = FakeLogger();
        printHandles(logger);

        assert.ok(logger.contains('no of handles 1'));
        assert.ok(logger.contains('http handle leaked'));
        assert.ok(logger.contains('test/leak-http.js:9:20'));
        assert.ok(logger.contains('host: \'www.google.com\''));
        assert.ok(logger.contains('fd: ' + req.socket._handle.fd));
        assert.ok(logger.contains('method: \'GET\''));
        assert.ok(logger.contains('path: \'/\''));

        req.once('close', function () {
            assert.end();
        });

        req.destroy();
    });

    req.end();
});
