var timeoutStacks = (function () {
    var $timers = require('timers');
    var $setInterval = $timers.setInterval;
    var $setTimeout = $timers.setTimeout;

    var stacks = {};

    global.setInterval = function (fn, timeout) {
        var stack = new Error().stack;

        if (!stacks[timeout]) {
            stacks[timeout] = [];
        }
        stacks[timeout].push(stack);

        return $setInterval.apply(this, arguments);
    }
    $timers.setInterval = global.setInterval;
    global.setTimeout = setTimeout = function (fn, timeout) {
        var stack = new Error().stack;

        if (!stacks[timeout]) {
            stacks[timeout] = [];
        }
        stacks[timeout].push(stack);

        return $setTimeout.apply(this, arguments);
    }
    $timers.setTimeout = global.setTimeout;

    return stacks;
}());

var setInterval = require('timers').setInterval;

var intervalHandle = setInterval(function handleInspectionLoop() {
    var handles = process._getActiveHandles();
    var requests = process._getActiveRequests();

    if (requests.length > 0) {
        console.log ('no of requests', requests.length);
    }

    console.log('');
    console.log('');
    console.log('no of handles', handles.length);
    handles.forEach(printHandle);
    console.log('');
    console.log('');

    function printHandle(obj) {
        if ('ontimeout' in obj) {
            if (obj && obj.msecs &&
                obj.msecs === intervalHandle._idleTimeout
            ) {
                console.log('timer handle (handleInspectLoop)');
            } else if (obj && obj._repeat) {
                printTimer(obj, 'setInterval');
            } else {
                printTimer(obj, 'setTimeout');
            }
        } else if ('readable' in obj && 'writable' in obj) {
            // to debug stream handles print the _events functions
            // to string and figure out what kind of stream they are
            // then stare really hard at the source code
            // console.log(obj._events.end.toString());

            if (obj._events &&
                obj._events.close &&
                typeof obj._events.close === 'function' &&
                String(obj._events.close).indexOf('maybeClose') !== -1
            ) {
                printChildProcessStream(obj);
            } else {
                printStream(obj, 'stream handle');
            }
        } else if ('pid' in obj) {
            printChildProcess(obj);
        } else {
            console.log('unknown handle', obj);
        }
    }

    function printTimer(obj, name) {
        var idleTimer = (obj && obj._idlePrev) ||
            (obj && obj._idleNext);

        console.log('');

        var fnName = idleTimer && idleTimer._onTimeout &&
            idleTimer._onTimeout.name || 'fn';
        var msg = 'timer handle (`' + name + '(' + fnName + 
            ', ' + obj.msecs + ')`)';
        console.log(msg);

        if (obj.msecs && timeoutStacks[obj.msecs]) {
            var stackMsg = 'timer handle leaked at one of: \n' +
                timeoutStacks[obj.msecs].map(function print(s) {
                    var lines = s.split('\n');
                    return lines[2];
                }).reduce(function (acc, i) {
                    if (acc.indexOf(i) === -1) {
                        acc.push(i);
                    }
                    return acc;
                }, []).join('\n');
            console.log(stackMsg);
        }

        if (!idleTimer) {
            console.log(obj);
        } else {
            console.log('timer listener',
                String(idleTimer._onTimeout));
        }

        console.log('');
    }

    function printStream(obj, phrase) {
        var fd = obj._handle && obj._handle.fd;
        var readable = obj.readable;
        var writable = obj.writable;

        console.log(phrase, {
            fd: fd,
            readable: readable,
            writable: writable
        });
    }

    function printChildProcessStream(obj) {
        printStream(obj, 'child process stdio stream handle');
    }

    function printChildProcess(obj) {
        console.log('child process handle', {
            pid: obj.pid
        });
    }

}, 5001); // use semi-random semi-unique timeout
intervalHandle.unref();
