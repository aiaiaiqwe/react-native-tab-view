/* eslint-disable import/no-commonjs */

const path = require('path');
const glob = require('glob-to-regexp');
const blacklist = require('metro-bundler/src/blacklist');

module.exports = {
  getProjectRoots() {
    return [__dirname, path.resolve(__dirname, '..')];
  },
  getProvidesModuleNodeModules() {
    return [
      'prop-types',
      'react-native-gesture-handler',
      'react-native',
      'react',
    ];
  },
  getBlacklistRE() {
    return blacklist([
      glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
      glob(`${__dirname}/node_modules/*/prop-types`),
    ]);
  },
};
