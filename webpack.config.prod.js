import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false,
};

export default {
  debug: true,
  devtool: 'source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  noInfo: true, // set to false to see a list of every file being bundled.
  entry: './src/index',
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    // Note: Physical files are only output by production build task `npm run build`.
    path: __dirname.concat('/dist'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ],
  module: {
    loaders: [
      { test: /\.js$/, include: path.join(__dirname, 'src'), loaders: ['babel'] },
      { test: /\.(jpe?g|png|gif|svg)$/i, loaders: ['file'] },
      {
        test: /(\.css|\.scss)$/,
        include: path.join(__dirname, 'src'),
        loader: ExtractTextPlugin.extract('css?sourceMap!sass?sourceMap'),
      },
    ],
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, 'node_modules')],
  },
};
