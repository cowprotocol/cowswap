// this is not used for now. we use "craco test", but eventually we will

/* eslint-disable */
export default {
  displayName: 'explorer',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/explorer',
  setupFilesAfterEnv: ['../../jest.setup.ts'],
  setupFiles: ['dotenv/config'],
}
