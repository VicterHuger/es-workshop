import baseConfig from './jest.config.base'
import type { Config } from 'jest'

const config: Config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.functional.ts'],
  testMatch: ['**/tests/functional/**/?(*.)+(test).[tj]s?(x)'],
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
  coveragePathIgnorePatterns: [
    '<rootDir>/src/components/',
    '<rootDir>/src/hooks/',
    '<rootDir>/src/mocks/',
    '<rootDir>/src/pages/',
    '<rootDir>/src/styles/',
    '<rootDir>/src/types/',
    '<rootDir>/prisma/generated',
    '<rootDir>/src/utils/event_sourcing',
  ],
}

export default config
