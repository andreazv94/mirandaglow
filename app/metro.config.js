// Permite que la app use el mismo motor de rutinas y catálogo que la web
// (../src/components/quiz-logic.ts y ../src/data/productos.ts).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '..', 'src')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
module.exports = config;
