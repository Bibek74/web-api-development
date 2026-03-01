// Install commands (do not run automatically):
// npm i -D jest jest-environment-jsdom @types/jest
// npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
// npm i -D identity-obj-proxy

const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
};

module.exports = createJestConfig(customJestConfig);