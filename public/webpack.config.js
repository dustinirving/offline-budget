const WebpackPwaManifest = require('webpack-pwa-manifest')
const path = require('path')

const config = {
  entry: {
    app: './assets/js/index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      inject: false,
      name: 'Offline Transactions',
      short_name: 'Budget',
      description:
        'An application that allows you to add or subtract funds from your budget',
      background_color: '#01579b',
      theme_color: '#ffffff',
      'theme-color': '#ffffff',
      start_url: '/',
      icons: [
        {
          src: path.resolve('icons/icon-512x512.png'),
          sizes: [72, 96, 128, 144, 152, 180, 192, 256, 384, 512],
          destination: path.join('assets', 'icons')
        }
      ]
    })
  ]
}

module.exports = config
