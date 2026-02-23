const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Force Metro to prioritize the local node_modules
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Re-direct native-specific modules to the local copy
config.resolver.extraNodeModules = {
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  react: path.resolve(projectRoot, "node_modules/react"),
};

module.exports = config;
