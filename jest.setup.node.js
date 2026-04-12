/**
 * jest.setup.node.js
 *
 * setupFiles polyfill — runs before each test file in all environments.
 * Provides Web API globals (Request, Response, Headers, fetch) for the
 * Node environment, where Next.js server modules expect them to exist.
 */

if (typeof Request === "undefined") {
  const nodeFetch = require("node-fetch");
  global.Request = nodeFetch.Request;
  global.Response = nodeFetch.Response;
  global.Headers = nodeFetch.Headers;
  global.fetch = nodeFetch.default;
}
