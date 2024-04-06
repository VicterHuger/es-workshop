import baseConfig from './jest.config.base'
import type { Config } from 'jest'

const config: Config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.unit.ts'],
  testMatch: ['**/tests/unit/**/?(*.)+(test).[tj]s?(x)'],
  maxWorkers: '50%',
}

export default config
