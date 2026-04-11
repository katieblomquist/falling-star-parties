module.exports = new Proxy(
  {},
  {
    get: () =>
      () => ({
        className: "mocked-font",
        style: { fontFamily: "mocked" },
        variable: "--mocked-font",
      }),
  }
);
