// no strict mode! We're doing hacky stuff here

// TODO catch window.onerror

const nodeConsole = require('console');

let originalConsole = window.console;

newConsole = {};
for (let prop of Object.getOwnPropertyNames(originalConsole)) {
  newConsole[prop] = function() {
    originalConsole[prop].apply(originalConsole, arguments);
    nodeConsole[prop].apply(nodeConsole, arguments);
  }
}


newConsole.warn = function() {
  originalConsole.warn.apply(originalConsole, arguments);
  arguments[0] = "\x1b[33m" + arguments[0] + "\x1b[0m";
  nodeConsole.warn.apply(nodeConsole, arguments);
}

newConsole.error = function() {
  originalConsole.error.apply(originalConsole, arguments);
  arguments[0] = "\x1b[41m" + "\x1b[37m" + arguments[0] + "\x1b[0m";
  nodeConsole.error.apply(nodeConsole, arguments);
}


console = newConsole;
