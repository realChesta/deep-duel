// no strict mode! We're doing hacky stuff here

const nodeConsole = require('console');

let originalConsole = window.console;

newConsole = {};
for (let prop of Object.getOwnPropertyNames(originalConsole)) {
  newConsole[prop] = function() {
    originalConsole[prop].apply(originalConsole, arguments);
    nodeConsole[prop].apply(nodeConsole, arguments);
  }
}


let oldWarn = newConsole.warn;
newConsole.warn = function() {
  arguments[0] = "\x1b[33m" + arguments[0] + "\x1b[0m";
  oldWarn.apply(newConsole, arguments);
}

let oldError = newConsole.error;
newConsole.error = function() {
  arguments[0] = "\x1b[41m" + "\x1b[37m" + arguments[0] + "\x1b[0m";
  oldError.apply(newConsole, arguments);
}


console = newConsole;
