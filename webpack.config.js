const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    target: 'electron-renderer',
    entry: './src/renderer/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist/renderer'),
      filename: 'bundle.js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, './src/renderer'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html',
        filename: 'index.html',
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : []),
    ],
    devtool: isProduction ? false : 'source-map',
    mode: argv.mode,
  };
}; 