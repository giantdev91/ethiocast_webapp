const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.resolve.alias["../Utilities/Platform"] =
    "react-native-web/dist/exports/Platform";
  config.module.rules.forEach((r) => {
    if (r.oneOf) {
      r.oneOf.forEach((o) => {
        if (o.use && o.use.loader && o.use.loader.includes("babel-loader")) {
          o.include = [
            path.resolve("."),
            path.resolve("node_modules/@ui-kitten/components"),
            path.resolve("node_modules/react"),
            path.resolve("node_modules/react-native"),
          ];
        }
      });
    }
  });
  return config;
};
