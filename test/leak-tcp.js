var printHandles = require('../print-handles.js');

var test = require('tape');
var net = require('net');

var FakeLogger = require('./lib/fake-logger.js');

test('leak a socket', function t(assert) {
    var socket = net.createConnection();

    var logger = FakeLogger();
    printHandles(logger);

    assert.ok(logger.contains('no of handles 1'));
    assert.ok(logger.contains('tcp handle leaked'));
    assert.ok(logger.contains('test/leak-tcp.js:9:22'));
    assert.ok(logger.contains('address: \'127.0.0.1\''));
    assert.ok(logger.contains('fd: ' + socket._handle.fd));

    socket.once('close', function () {
        assert.end();
    })

    socket.destroy();
});
