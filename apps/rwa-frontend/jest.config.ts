export default {
  displayName: 'rwa-frontend',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: [['@nx/react/babel', { runtime: 'automatic' }]] }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/jest/cssModuleMock.js',
    '^lightweight-charts$': '<rootDir>/jest/lightweightChartsMock.js',
    '^server-only$': '<rootDir>/jest/serverOnlyMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coverageDirectory: '../../coverage/apps/rwa-frontend',
}
