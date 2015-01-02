'use strict';

var process = require('process');

var printHandle = require('./print-handle.js');

module.exports = printHandles;

function printHandles(console, config) {
    config = config || {};

    var handles = process._getActiveHandles();
    var requests = process._getActiveRequests();

    if (requests.length > 0) {
        console.log('no of requests', requests.length);
    }

    console.log('');
    console.log('');
    console.log('no of handles', handles.length);
    handles.forEach(function forHandle(h) {
        printHandle(h, console, config);
    });
    console.log('');
    console.log('');
}
