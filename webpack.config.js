const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExternalsPlugin   = require('webpack-externals-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'pixi-ae.js',
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
    new ExternalsPlugin({
      include: path.join(__dirname, 'node_modules', 'pixi.js'),
      type: 'var'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true
      }
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
