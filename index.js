'use strict';

var printHandles = require('./print-handles.js');
var printHandle = require('./print-handle.js');

var console = require('console');
var process = require('process');
var setTimeout = require('timers').setTimeout;
var mutableExtend = require('xtend/mutable');

var mutableConfig = {};

(function wrapIt() {
    var EventEmitter = require('events').EventEmitter;
    var $emit = EventEmitter.prototype.emit;

    EventEmitter.prototype.emit = function fakeEmit(type, value) {
        if (type === 'error' && !this._events.error &&
            (mutableConfig.debugErrors || mutableConfig.debugSockets)
        ) {
            console.log('unhandled error', new Error().stack);
            printHandle(this, console, mutableConfig);
            // console.log('addr', this.address());
            // console.log('server addr', this.server.address());
        }

        return $emit.apply(this, arguments);
    };
}());

module.exports = {
    set: function set(opts) {
        mutableExtend(mutableConfig, opts);

        if ('timeout' in opts) {
            printHandle.INTERVAL_HANDLE_TIMEOUT = opts.timeout +
                Math.floor(Math.random() * 100);
        }

        return this;
    },
    printHandles: function $printHandles() {
        printHandles(console, mutableConfig);
    }
};

process.nextTick(function onTick() {
    var timeoutHandle = setTimeout(function handleInspectionLoop() {
        printHandles(console, mutableConfig);

        timeoutHandle = setTimeout(handleInspectionLoop,
            printHandle.INTERVAL_HANDLE_TIMEOUT);
        timeoutHandle.unref();
    }, printHandle.INTERVAL_HANDLE_TIMEOUT);
    timeoutHandle.unref();
});
