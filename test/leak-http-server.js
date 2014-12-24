'use strict';

var printHandles = require('../print-handles.js');

var test = require('tape');
var http = require('http');

var FakeLogger = require('./lib/fake-logger.js');

test('leak a http request', function t(assert) {
    var server = http.createServer();
    server.listen(0);

    var logger = FakeLogger();
    printHandles(logger);

    assert.ok(logger.contains('no of handles 1'));
    assert.ok(logger.contains('http server handle leaked'));
    assert.ok(logger.contains('test/leak-http-server.js:11:23'));
    assert.ok(logger.contains('fd: ' + server._handle.fd));
    assert.ok(logger.contains('address: \'0.0.0.0\''));

    server.close();
    assert.end();
});
