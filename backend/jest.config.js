export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.d.ts",
    "!index.ts",
    "!__tests__/**",
    "!jest.config.js"
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/__tests__/__mocks__/uuid.js"
  }
};
