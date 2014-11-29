var test = require('tape');

var leakedHandles = require('../index.js');

test('leakedHandles is a function', function (assert) {
    assert.equal(typeof leakedHandles, 'function');
    assert.end();
});
