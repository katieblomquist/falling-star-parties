// Returns empty string for CSS modules
const styleMock = new Proxy(
  {},
  { get: (_target, prop) => (typeof prop === "string" ? prop : "") }
);

module.exports = styleMock;
