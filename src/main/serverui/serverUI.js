'use strict';

const electron = require('electron');
const {app, BrowserWindow, powerSaveBlocker} = electron;
const url = require('url');
const path = require('path');

let mainWindow;

app.commandLine.appendSwitch("disable-background-timer-throttling");
powerSaveBlocker.start('prevent-display-sleep');

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#000000'
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
