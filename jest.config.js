import { config } from '@jjangga0214/jest-config'

export default {
  ...config,
  // A preset that is used as a base for Jest's configuration
  // preset: 'ts-jest',
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  // testPathIgnorePatterns: ['/node_modules/',],
  // A map from regular expressions to paths to transformers
  // transform: {
  //   '^.+\\.(m|c)?(t|j)sx?$': ['@swc/jest'],
  // },
  // transform: { '^.+\\.(m|c)?(t|j)sx?$': ['esbuild-jest'] },
  // transform: {
  //   '^.+\\.(m)?(t|j)sx?$': ['ts-jest', {
  //     useESM: true,
  //   },],
  //   '^.+\\.c(t|j)sx?$': ['ts-jest'],
  // },
  testTimeout: 60 * 1000,
}
