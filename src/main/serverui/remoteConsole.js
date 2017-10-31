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

let oldWarn = nodeConsole.warn;
nodeConsole.warn = function() {
  arguments[0] = "\x1b[33m" + arguments[0];
  arguments[arguments.length - 1] += "\x1b[0m";
  oldWarn.apply(nodeConsole, arguments);
}

let oldErr = nodeConsole.error;
nodeConsole.error = function() {
  arguments[0] = "\x1b[41m" + "\x1b[37m" + arguments[0];
  arguments[arguments.length - 1] += "\x1b[0m";
  oldErr.apply(nodeConsole, arguments);
}

console = newConsole;



window.onerror = function(event, source, lineno, colno, error) {
  nodeConsole.error(source + "(" + lineno + ":" + colno + ")" + ": " + error);
  nodeConsole.log(error.stack);
};

window.onunhandledrejection = function(event) {
    nodeConsole.error("Unhandled promise rejection:", event.reason);
    if (event.reason.stack)
      nodeConsole.log(event.reason.stack);
    else
      nodeConsole.log(event.reason);
    nodeConsole.log("Promise:", event.promise);
};
