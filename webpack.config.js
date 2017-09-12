var path = require("path");
var webpack = require("webpack");

function resolve(filePath) {
  return path.join(__dirname, filePath)
}

var babelOptions = {
  presets: [["es2015", { "modules": false }]],
  plugins: [["transform-runtime", {
    "helpers": true,
    // We don't need the polyfills as we're already calling
    // cdn.polyfill.io/v2/polyfill.js in index.html
    "polyfill": false,
    "regenerator": false
  }]]
};

var isProduction = process.argv.indexOf("-p") >= 0;
var suavePort = process.env.SUAVE_FABLE_PORT || "8085";
console.log("Bundling for " + (isProduction ? "production" : "development") + "...");

module.exports = {
  devtool: "source-map",
  entry: resolve('./src/Client/Client.fsproj'),
  output: {
    filename: 'bundle.js',
    path: resolve('./public'),
  },
  resolve: {
    modules: [
      "node_modules", resolve("./node_modules/")
    ]
  },
  devServer: {
    contentBase: resolve('./public'),
    port: 8080,
    proxy: {
      '/api/*': {
        target: 'http://localhost:' + suavePort,
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.fs(x|proj)?$/,
        use: {
          loader: "fable-loader",
          options: {
            babel: babelOptions,
            define: isProduction ? [] : ["DEBUG"]
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions
        },
      },
      {
        test: /\.sass$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  }
};