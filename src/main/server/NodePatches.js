// no strict mode!

const readline = require('readline');

// Includes some Node patches, eg. an interactive server console.
class NodePatches {
  static initInteractiveServerConsole(exec) {
    if (NodePatches._inittedISC)
      throw new Error("Tried to initialize interactive server console a second time!");   // TODO Actually allow this - register handlers instead
    NodePatches._inittedISC = true;

    if (!exec)
      exec = (js, callback) => callback(eval(js));



    /*const oldWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = function() {
      oldWrite('\b\b');
      oldWrite.apply(this, arguments);
      oldWrite('> ');
    };
    oldWrite('> ');*/     // TODO Uncomment and fix this)


    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.setPrompt('> ');
    rl.prompt();



    rl.on('line', function(line) {
      exec(line, function(result) {
        console.log(result);
        rl.prompt();
      });
    }).on('close', function() {
      process.exit();
    });



  }
}



module.exports = NodePatches;
