const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',  //possible debug
  devtool: false,
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/img', to: 'img' }, // Copies all files from public/img to dist/img
      ],
    }),
  ],

});



