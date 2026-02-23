const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Instead of just an array, we tell Metro explicitly about the roots
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// This line helps expo-doctor understand the relative pathing
config.transformer = {
  ...config.transformer,
  _expoRelativeProjectRoot: projectRoot,
};

// Keep this for the 'canonicalize' fix we did earlier
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
