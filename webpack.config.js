const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    main: './src/main.js',
    mock: './src/tests/index.js'
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, 'bin')
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      }
    ]
  },
  optimization: {
    minimize: false
  }
}