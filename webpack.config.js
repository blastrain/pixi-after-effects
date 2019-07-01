const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'pixi-ae.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
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
    new webpack.ProvidePlugin({
      PIXI: 'pixi.js',
    }),

  ],

  devServer: {
    contentBase: 'dist',
    disableHostCheck: true,
    inline: true,
    historyApiFallback: true,
    compress: true
  }
};
