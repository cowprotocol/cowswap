import type { CowSwapTheme } from '@cowprotocol/ui'

import { GraffitiThemeContext, isGraffitiWallPath, resolveGraffitiTheme } from './graffitiWall.utils'

const ON: GraffitiThemeContext = {
  wallEnabled: true,
  themeFlagEnabled: true,
  onSolanaChain: true,
  onWallPage: false,
  optedOut: false,
}

describe('resolveGraffitiTheme', () => {
  const cases: Array<{ name: string; context: Partial<GraffitiThemeContext>; expected: CowSwapTheme | undefined }> = [
    { name: 'activates on the Solana chain', context: {}, expected: 'darkGraffiti' },
    { name: 'skips off the Solana chain', context: { onSolanaChain: false }, expected: undefined },
    { name: 'skips when the graffiti wall is off', context: { wallEnabled: false }, expected: undefined },
    { name: 'skips when the theme flag is off', context: { themeFlagEnabled: false }, expected: undefined },
    { name: 'skips when the user opted out', context: { optedOut: true }, expected: undefined },
    {
      name: 'activates on the wall page off the Solana chain',
      context: { onSolanaChain: false, onWallPage: true },
      expected: 'darkGraffiti',
    },
    {
      name: 'keeps the theme on the wall page even when the user opted out',
      context: { onWallPage: true, optedOut: true },
      expected: 'darkGraffiti',
    },
    {
      name: 'skips on the wall page when the graffiti wall is off',
      context: { onWallPage: true, wallEnabled: false },
      expected: undefined,
    },
    {
      name: 'skips on the wall page when the theme flag is off',
      context: { onWallPage: true, themeFlagEnabled: false },
      expected: undefined,
    },
  ]

  test.each(cases)('$name', ({ context, expected }) => {
    expect(resolveGraffitiTheme({ ...ON, ...context })).toBe(expected)
  })
})

describe('isGraffitiWallPath', () => {
  test.each([
    ['/graffiti', true],
    ['/graffiti/claim', true],
    ['/swap', false],
    ['/', false],
  ])('%s -> %s', (pathname, expected) => {
    expect(isGraffitiWallPath(pathname)).toBe(expected)
  })
})
