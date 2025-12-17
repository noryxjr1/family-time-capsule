// Browser shim for packages that (incorrectly) pull in React Native AsyncStorage.
// Metamask SDK's browser build may reference this module in some bundlers.
module.exports = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
  clear: async () => undefined,
};

module.exports.default = module.exports;

