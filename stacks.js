'use strict';

var createStore = require('weakmap-shim/create-store');

function Box(store) {
    return { get: get };

    function get(handle) {
        var value = store(handle);
        return value && value.meta;
    }
}

var fsWatchStacks = (function wrapFSWatcher() {
    var $fs = require('fs');

    var watcher = $fs.watch(__filename);
    watcher.close();
    var $FSWatcher = watcher.constructor;
    var $start = $FSWatcher.prototype.start;

    var watchStore = createStore();

    $FSWatcher.prototype.start = function fakeStart(file) {
        var stack = new Error().stack;

        var value = watchStore(this);
        value.meta = {
            stack: stack,
            filename: file
        };

        return $start.apply(this, arguments);
    };

    return Box(watchStore);
}());

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
    var $createServer = $net.createServer;

    var requestStore = createStore();
    var serverStore = createStore();

    $net.createConnection = function fakeCreateConnection() {
        var stack = new Error().stack;

        var $socket = $createConnection.apply(this, arguments);
        // var $addr = $socket.address();

        var value = requestStore($socket);
        value.meta = {
            stack: stack
        };

        return $socket;
    };

    $net.createServer = function fakeCreateServer() {
        var stack = new Error().stack;

        var $server = $createServer.apply(this, arguments);

        var value = serverStore($server);
        value.meta = {
            stack: stack
        };

        return $server;
    };

    return {
        requests: Box(requestStore),
        servers: Box(serverStore)
    };
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
    var store = createStore();

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

        var value = store($timer);
        value.meta = {
            stack: stack
        };

        return $timer;
    };
    $timers.setTimeout = global.setTimeout;

    return {
        stacks: stacks,
        box: Box(store)
    };
}());

var httpStacks = (function () {
    var $http = require('http');
    var $request = $http.request;
    var $createServer = $http.createServer;

    var requestStore = createStore();
    var serverStore = createStore();

    $http.request = function fakeRequest() {
        var stack = new Error().stack;

        var $req = $request.apply(this, arguments);

        var value = requestStore($req);
        value.meta = {
            stack: stack
        };

        return $req;
    };

    $http.createServer = function fakeCreateServer() {
        var stack = new Error().stack;

        var $server = $createServer.apply(this, arguments);

        var value = serverStore($server);
        value.meta = {
            stack: stack
        };

        return $server;
    };

    return {
        requests: Box(requestStore),
        servers: Box(serverStore)
    };
}());

module.exports = {
    http: httpStacks,
    timeout: timeoutStacks,
    tcp: tcpStacks,
    childProcess: childProcessStacks,
    fileWatcher: fsWatchStacks
};
