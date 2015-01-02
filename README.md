# leaked-handles

<!--
    [![build status][build-png]][build]
    [![Coverage Status][cover-png]][cover]
    [![Davis Dependency status][dep-png]][dep]
-->

<!-- [![NPM][npm-png]][npm] -->

<!-- [![browser support][test-png]][test] -->

Detect any handles leaked in node

## Example

```js
require("leaked-handles");
```

## Example output.

```
no of handles 1

timer handle (`setTimeout(any, 1000)`)
timer handle leaked at one of: 
    at Test.t (/home/raynos/uber/leaked-handles/test/leak-timer.js:10:17)
timer listener function any() {}


no of handles 1
tcp handle leaked at one of: 
    at Test.t (/home/raynos/uber/leaked-handles/test/leak-tcp.js:9:22)
tcp stream { fd: 10,
  readable: false,
  writable: true,
  address: { address: '127.0.0.1', family: 'IPv4', port: 39126 } }
```

## Options

```js
require('leaked-handles').set({
    fullStack: true, // use full stack traces
    timeout: 30000, // run every 30 seconds instead of 5.
    debugSockets: true // pretty print tcp thrown exceptions.
});
```

## Explanation

Add this to the TOP of your tests as the very first require.

This will now print any handles that keep your process open.

It has pretty printing of some handles including

 - timers. Tells the timeout and the file that leaked it.
 - child processes. Tells you that a handle is leaked because
    of a spawned child process and the pid.
 - stream. Prints the fact the handle is a stream and the fd.
 - child process stream. Prints the fact the handle is a stream
    and specifically one of the three fds for the child process.

## Debugging tips

When you see a timer, it will print the file, so go fix it!

When you see a child process it prints the pid. Run `ps -p {pid}`
  and figure out what kind of child process it is.

When you see a stream it prints the fd. Run `lsof -p {process.pid}`
  to see what fds your test process has open and see if you can
  figure out what the hell it is.

When you see a child process stream, go find the child process
  that leaked. If no child process leaked then again, use `lsof`
  to lookup up the fd.

## Installation

`npm install leaked-handles`

## Tests

`npm test`

## Contributors

 - Raynos

## MIT Licenced

  [build-png]: https://secure.travis-ci.org/Raynos/leaked-handles.png
  [build]: https://travis-ci.org/Raynos/leaked-handles
  [cover-png]: https://coveralls.io/repos/Raynos/leaked-handles/badge.png
  [cover]: https://coveralls.io/r/Raynos/leaked-handles
  [dep-png]: https://david-dm.org/Raynos/leaked-handles.png
  [dep]: https://david-dm.org/Raynos/leaked-handles
  [test-png]: https://ci.testling.com/Raynos/leaked-handles.png
  [test]: https://ci.testling.com/Raynos/leaked-handles
  [npm-png]: https://nodei.co/npm/leaked-handles.png?stars&downloads
  [npm]: https://nodei.co/npm/leaked-handles
