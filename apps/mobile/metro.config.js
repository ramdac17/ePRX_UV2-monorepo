const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { pathToFileURL } = require("url"); // Add this

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// FORCE DISABLE the problematic exports logic
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
