const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-skia ships its web renderer as WebAssembly.
config.resolver.assetExts.push('wasm');

module.exports = config;
