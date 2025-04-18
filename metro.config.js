const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("glb");

// Passa a config final pro NativeWind
module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
