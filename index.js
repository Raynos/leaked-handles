var printHandles = require('./print-handles.js');

var console = require('console');
var setInterval = require('timers').setInterval;

var intervalHandle = setInterval(function handleInspectionLoop() {
    printHandles(console);
}, printHandles.INTERVAL_HANDLE_TIMEOUT); // use semi-random semi-unique timeout
intervalHandle.unref();
