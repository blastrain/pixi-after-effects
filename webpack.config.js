const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'pixi-ae.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },

  externals: {
    'pixi.js': 'PIXI'
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: 'index.html' },
      { from: 'node_modules/dat.gui/build/dat.gui.min.js' },
      { from: 'examples', to: 'examples' }
    ]),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false
    })
  ],

  devServer: {
    contentBase: 'dist',
    disableHostCheck: true,
    inline: true,
    historyApiFallback: true,
    compress: true
  }
};
