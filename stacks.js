var createStore = require('weakmap-shim/create-store');

function Box(store) {
    return { get: get };

    function get(handle) {
        var value = store(handle);
        return value && value.meta;
    }
}

var childProcessStacks = (function () {
    var $childProcess = require('child_process');
    var $spawn = $childProcess.spawn;

    var store = createStore();

    $childProcess.spawn = function fakeSpawn() {
        var stack = new Error().stack;
        var value;

        var proc = $spawn.apply(this, arguments);

        if (proc.pid) {
            value = store(proc);
            value.meta = {
                stack: stack,
                command: arguments[0],
                args: arguments[1]
            };

        }

        if (proc.stdout && typeof proc.stdout === 'object') {
            value = store(proc.stdout);
            value.meta = {
                stack: stack,
                type: 'stdout'
            };
        }
        if (proc.stderr && typeof proc.stdout === 'object') {
            value = store(proc.stderr);
            value.meta = {
                stack: stack,
                type: 'stderr'
            };
        }
        if (proc.stdin && typeof proc.stdout === 'object') {
            value = store(proc.stdin);
            value.meta = {
                stack: stack,
                type: 'stdin'
            };
        }

        return proc;
    };

    return Box(store);
}());

var tcpStacks = (function () {
    var $net = require('net');
    var $createConnection = $net.createConnection;

    var store = createStore();

    $net.createConnection = function fakeCreateConnection() {
        var stack = new Error().stack;

        var $socket = $createConnection.apply(this, arguments);
        // var $addr = $socket.address();

        var value = store($socket);
        value.meta = {
            stack: stack
        };

        return $socket;
    };

    return Box(store);
}());

function applyKeyedList(obj, key, v) {
    if (!obj[key]) {
        obj[key] = [];
    }

    obj[key].push(v);
}

var timeoutStacks = (function () {
    var $timers = require('timers');
    var $setInterval = $timers.setInterval;
    var $setTimeout = $timers.setTimeout;

    var stacks = {};

    /*globals global*/
    global.setInterval = function fakeSetInterval(fn, timeout) {
        var stack = new Error().stack;

        var $timer = $setInterval.apply(this, arguments);

        applyKeyedList(stacks, timeout, stack);

        return $timer;
    };
    $timers.setInterval = global.setInterval;
    global.setTimeout = function fakeSetTimeout(fn, timeout) {
        var stack = new Error().stack;

        var $timer = $setTimeout.apply(this, arguments);

        applyKeyedList(stacks, timeout, stack);

        return $timer;
    };
    $timers.setTimeout = global.setTimeout;

    return stacks;
}());

var httpStacks = (function () {
    var $http = require('http');
    var $request = $http.request;

    var store = createStore();

    $http.request = function fakeRequest(options) {
        var stack = new Error().stack;

        var $req = $request.apply(this, arguments);

        var value = store($req);
        value.meta = {
            stack: stack
        };

        return $req;
    };

    return Box(store);
}());

module.exports = {
    http: httpStacks,
    timeout: timeoutStacks,
    tcp: tcpStacks,
    childProcess: childProcessStacks
};
