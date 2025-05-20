const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required to fix Firebase ESM import issues
config.resolver.sourceExts.push('cjs');

module.exports = config;
