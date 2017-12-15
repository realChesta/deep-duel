// no strict mode!

const readline = require('readline');

// Includes some Node patches, eg. an interactive server console.
class NodePatches {
  static initInteractiveServerConsole(exec) {
    return; // TODO Fix this - currently doesn't work on some set-ups (for unknown reasons; stdin seems to be closed on start)

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
    oldWrite('> ');*/     // TODO Uncomment and fix this


    console.log("Intializing readline...", process.stdin);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.setPrompt('> ');
    rl.prompt();
    console.log("Initialized readline", rl);



    rl.on('line', function(line) {
      exec(line, function(result) {
        console.log(result);
        rl.prompt();
      });
    }).on('close', function() {
      console.log("Shutting down game server...", process.stdin)
      process.exit();
    });



  }
}



module.exports = NodePatches;
