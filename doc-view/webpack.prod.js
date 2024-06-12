const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',  //possible debug
  devtool: false,
  plugins: [
    ...common.plugins, 
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/img', to: 'img' },
        { from: 'extra-production', to: '' },
      ],
    }),
  ],

});



