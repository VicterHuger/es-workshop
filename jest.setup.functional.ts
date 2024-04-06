import { truncateDB } from './src/tests/utils/truncateDb'
import '@testing-library/jest-dom'

global.beforeEach(async () => {
  await truncateDB()
})

global.afterEach(async () => {
  await truncateDB()
})
