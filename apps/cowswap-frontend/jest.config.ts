// this is not used for now. we use "craco test", but eventually we will

/* eslint-disable */
export default {
  displayName: 'cowswap',
  preset: './jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/cowswap',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  transformIgnorePatterns: ['node_modules/(?!@ledgerhq/connect-kit-loader)'],
}
