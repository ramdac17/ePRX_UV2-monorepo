const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Force Metro to resolve the "browser" version of packages
// This prevents Axios from trying to load the "node" version with 'crypto'
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Ensure Metro watches the workspace root for @repo/types
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
