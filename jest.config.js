/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          moduleResolution: "node",
        },
      },
    ],
  },
  moduleNameMapper: {
    // path alias
    "^@/(.*)$": "<rootDir>/src/$1",
    // CSS / image modules
    "^.+\\.module\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^.+\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    // next/font stubs
    "^next/font/(.*)$": "<rootDir>/__mocks__/nextFontMock.js",
    // next/navigation stub
    "^next/navigation$": "<rootDir>/__mocks__/nextNavigationMock.js",
    // next/link stub
    "^next/link$": "<rootDir>/__mocks__/nextLinkMock.tsx",
  },
  setupFiles: ["<rootDir>/jest.setup.node.js"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
  ],
};

module.exports = config;
