const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const RunDocServerPlugin = require('./RunDocServerPlugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './public',
    port: 8080,
    hot: true,
  },
  plugins: [
    new RunDocServerPlugin(),
  ],
});