const path = require('path');
const fs = require('fs');

module.exports = {
    entry: ['babel-polyfill', './src/game/common/Utils/buggy-gg', './src/main/client/client.js'],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'raw-loader', 'sass-loader']
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/lance-gg'),
                    fs.realpathSync('./node_modules/lance-gg')
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['babel-preset-env'].map(require.resolve)
                }
            }
        ]
    },
    resolve: {
        alias: {
          'lance': path.resolve(__dirname, 'node_modules/lance-gg/src/'),
          'game': path.resolve(__dirname, 'src/game'),
          'main': path.resolve(__dirname, 'src/main')
        }
    }
};
