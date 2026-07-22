import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });
const common = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};

export default async () => ({
  projects: [
    await createJestConfig({
      ...common,
      displayName: 'unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
    })(),
    await createJestConfig({
      ...common,
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
    })(),
  ],
});
