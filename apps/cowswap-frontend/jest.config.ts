// this is not used for now. we use "craco test", but eventually we will

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workspaceRoot = path.resolve(__dirname, '../..')

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
    '^wagmi$': require.resolve('wagmi', { paths: [workspaceRoot] }),
    '^@reown/appkit/react$': '<rootDir>/../../testing/reownMock.ts',
  },
}
