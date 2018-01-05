const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './remote.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'remote.js',
    library: 'RemoteInstance'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
