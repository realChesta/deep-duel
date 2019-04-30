# Deep Duel

![AI-img](https://piskel-imgstore-b.appspot.com/img/18dea273-b756-11e7-a7ae-c3cc346e19f0.gif)

This is a game where you play against an AI that is constantly learning from your mistakes.

## Getting Started
First get Node.js and npm [from here](https://nodejs.org/en/download/), then update it with the following commands:
```shell
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

Then, cd to this directory and run `npm install`. To launch the server, use one of the following commands:

```shell
npm run-script cmd-p # for the command-line server
npm run-script ui # for the server UI
```

You can then connect to your server (default `127.0.0.1:3000`).


## Resources

* Game engine for multiplayer is [lance.gg](http://lance.gg/)
* Rendering and stuff done using [PixiJS](http://www.pixijs.com)
* Neural networks done with [synaptic.js](http://caza.la/synaptic/)
* Storing data with [diskDB](https://www.npmjs.com/package/diskdb)
