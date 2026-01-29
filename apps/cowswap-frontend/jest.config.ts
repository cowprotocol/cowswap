// this is not used for now. we use "craco test", but eventually we will

export default {
  displayName: 'cowswap',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/cowswap',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!.*(react-dnd|dnd-core|@react-dnd|wagmi|@wagmi|viem|@reown))',
    '/node_modules/(?!(\\.pnpm|react-dnd|dnd-core|@react-dnd|wagmi|@wagmi|viem|@reown))',
  ],
  moduleNameMapper: {
    '^@reown/appkit/react$': '<rootDir>/../../testing/reownMock.ts',
  },
}
