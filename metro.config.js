// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Optional: Add any custom configurations here
  // For example, if you need SVG support:
  // const { assetExts, sourceExts } = config.resolver;
  // config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
  // config.resolver.sourceExts = [...sourceExts, 'svg'];

  return config;
})();