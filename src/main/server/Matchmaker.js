'use strict';

import socketIO from 'socket.io';
import DDUtils from 'game/common/Utils/DDUtils';

class Matchmaker {
  constructor(io, startServer) {
    this.playerQueue = [];
    this.startServer = startServer;

    io.on('connection', (socket) => {
      console.log("A user connected to the matchmaker from " +
          socket.conn.remoteAddress + " (socket id: " + socket.conn.id + ")");

      // Join player queue
      socket.once('jpq', (msg) => {
        this.addPlayer(socket);
      });

      // On disconnect
      socket.once('disconnect', (msg) => {
        for (let i = 0; i < this.playerQueue.length; i++) {
          if (this.playerQueue[i] == socket) {
            this.playerQueue.splice(i, 1);
          }
        }
      });


    });


  }

  async addPlayer(socket) {
    // TODO move player count to somewhere else
    let playerCount = 2;

    this.playerQueue.push(socket);
    while (this.playerQueue.length >= playerCount) {
      let arr = [];
      for (let i = 0; i < playerCount; i++) {
        arr.push(this.playerQueue.shift());
      }

      // TODO Right now spamming jpq will delay it for everyone else, since you'll always have to wait 5s until timeout. Fix that
      let accepted = [];
      try {
        await Promise.all(arr.map(s => DDUtils.socketMessage(s, 'matchmakingFound', 'meReady', 5000).then(() => accepted.push(s))));
      } catch (e) {
        this.playerQueue.push.apply(this.playerQueue, accepted);
      }

      this.startServer(arr);
    }
  }


}

module.exports = Matchmaker;
