// https://webpack.js.org/guides/getting-started
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',   //default
  entry: {
    Report: {
      import:['./src/index.js', './src/index.css'],
    },
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'lumiDocView.js',  // own names
      myPageHeader: '',
      // config
      template: './public/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'lumiDocView.css',
    }),
  ],
  output: {
    filename: 'lumiDocView.js',
    library: 'lumiDocView',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator : {
          filename : './img/[name][ext][query]',
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator : {
          filename : './fonts/[name][ext][query]',
        }
      }
    ],
  },
};