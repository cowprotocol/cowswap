// this is not used for now. we use "craco test", but eventually we will

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default {
  displayName: 'cowswap',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@nx/react/babel'],
        // `babel-plugin-macros` has to run BEFORE the JSX transform, and listing it here is the only
        // way to get that: Babel runs top-level plugins ahead of every preset plugin. Left to the
        // preset chain alone (`@nx/js/babel` supplies macros, `@babel/preset-react` supplies the JSX
        // transform) `<Plural>` is rewritten to `_jsx(Plural, { value, one, few, many, other })`
        // before macros sees it, and macros then reads that 5-property props object as a labelled
        // expression and throws "Incorrect usage, expected exactly one property".
        // The Vite build never hits this because `vite-plugin-babel-macros` runs macros as its own
        // pass, before vite's React transform touches the file.
        plugins: ['macros'],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/cowswap',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: [
    '/node_modules/.pnpm/(?!.*(react-dnd|dnd-core|@react-dnd|wagmi|@wagmi|viem|@reown|jotai-tanstack-query))',
    '/node_modules/(?!(\\.pnpm|react-dnd|dnd-core|@react-dnd|wagmi|@wagmi|viem|@reown|jotai-tanstack-query))',
  ],
  moduleNameMapper: {
    '^wagmi$': require.resolve('wagmi'),
    '^@reown/appkit/react$': '<rootDir>/../../testing/reownMock.ts',
    '^@reown/appkit-adapter-wagmi$': '<rootDir>/src/mocks/reownAdapterMock.ts',
    '^@reown/appkit-adapter-solana$': '<rootDir>/src/mocks/reownSolanaAdapterMock.ts',
    '^@reown/appkit-adapter-solana/react$': '<rootDir>/src/mocks/reownSolanaAdapterMock.ts',
  },
}
