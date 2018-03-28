'use strict';

import DDAIClientEngine from 'game/client/AIClient/DDAIClientEngine';
import process from 'process';

require('game/common/Utils/buggy-gg');

main();

async function main() {
  let engine = new DDAIClientEngine( {
    matchmaker: 'http://127.0.0.1:3000',
    autoConnect: false
  } );
  engine.start();
  await engine.connect();
  engine.startRandomInputs();

  console.log("Press any key to exit");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}
