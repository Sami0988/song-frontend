const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development', // switch to 'production' for production build
  entry: './src/index.jsx', // entry point of your React app
  output: {
    path: path.resolve(__dirname, 'dist'), // output directory
    filename: 'bundle.js', // bundled filename
    clean: true, // clean output directory before each build
  },
  resolve: {
    extensions: ['.js', '.jsx'], // file extensions to handle
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // for .js and .jsx files
        exclude: /node_modules/,
        use: 'babel-loader', // transpile JSX/JS with Babel
      },
      {
        test: /\.css$/, // handle CSS files
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // load images
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // use your HTML template
    }),
    new Dotenv(), // loads environment variables from .env file
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'), // serve static files from dist
    hot: true, // enable hot module replacement
    port: 3000,
    historyApiFallback: true, // for client-side routing support
  },
  devtool: 'source-map', // generate source maps for debugging
};
