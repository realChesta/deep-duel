'use strict';

module.exports = {


  socketMessage: function(socket, toSend, waitFor, timeout) {
    let promise = waitFor === undefined ? Promise.resolve :
      new Promise((resolve, reject) => {
        let b = false;

        socket.once(waitFor, (msg) => {
          if (b) return;
          b = true;
          console.log("Received " + waitFor + " from " + (socket.conn || {}).id);   // TODO remove debug msg
          resolve(msg);
        });

        if (timeout !== undefined) {
          setTimeout(() => {
            if (b) return;
            b = true;
            reject("timeout");
          }, timeout);
        }

      }
    );
    if (toSend !== undefined) socket.emit(toSend);
    console.log("Sent " + toSend + " to " + (socket.conn || {}).id + ". Waiting for " + waitFor);   // TODO remove debug msg
    return promise;
  },


};
