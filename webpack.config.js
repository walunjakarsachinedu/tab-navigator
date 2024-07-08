const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    background: path.resolve(__dirname, "src/background.ts"),
    content: path.resolve(__dirname, "src/content.ts"),
    "tab-navigator-component": path.resolve(__dirname, "src/components/tab-navigator-component.ts"),
  },
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "[name].js"
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          // step 2: convert javascript to backward compatible
          {
            loader: 'babel-loader',
            options: {
              "presets": [ 
                [
                  "@babel/preset-env",
                  {
                    "targets": {
                      "browsers": [
                        "last 2 versions",
                        "ie >= 11"
                      ]
                    }
                  }
                ]
              ]
            },
          },
          // step 1: convert typescript to javascript
          {
            loader: "ts-loader",
          }
        ],
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}