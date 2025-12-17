// Browser/build shim for `pino-pretty`.
// Some transitive dependencies reference it, but it's not needed for this app.
module.exports = function pinoPrettyShim() {
  return "";
};

module.exports.default = module.exports;

