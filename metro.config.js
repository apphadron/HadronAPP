const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("glb");

// Configurações para suprimir avisos e melhorar compatibilidade
config.resolver.platforms = ['native', 'android', 'ios', 'web'];
config.resolver.sourceExts = ['js', 'json', 'ts', 'tsx', 'jsx'];

// Suprimir avisos específicos do Metro
config.reporter = {
  ...config.reporter,
  update: () => {
    // Suprimir logs de atualização do Metro
  }
};

// Passa a config final pro NativeWind
module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
