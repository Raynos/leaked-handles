'use strict';

var printHandles = require('./print-handles.js');

var console = require('console');
var setTimeout = require('timers').setTimeout;

var timeoutHandle = setTimeout(function handleInspectionLoop() {
    printHandles(console);

    timeoutHandle = setTimeout(handleInspectionLoop,
        printHandles.INTERVAL_HANDLE_TIMEOUT);
    timeoutHandle.unref();
}, printHandles.INTERVAL_HANDLE_TIMEOUT); // use semi-random semi-unique timeout
timeoutHandle.unref();
