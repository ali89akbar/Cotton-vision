const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    fs: false,
    path: require.resolve("path-browserify"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
    assert: require.resolve("assert/"),
    buffer: require.resolve("buffer/"),
    util: require.resolve("util/"),
    url: require.resolve("url/"),
  };

  config.resolve.alias = {
    "process/browser": require.resolve("process/browser"),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  return config;
};
