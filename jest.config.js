module.exports = {
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  testEnvironment: "jsdom",
};
