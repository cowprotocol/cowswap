import { isSolanaBetaOrHigher, parseSolanaVersion } from './solanaVersion'

describe('parseSolanaVersion', () => {
  it.each(['alpha', 'beta', 'ga'])('keeps the known version %s', (value) => {
    expect(parseSolanaVersion(value)).toBe(value)
  })

  it.each([undefined, null, '', 'disabled', 'GA', true, 1, {}])(
    'falls back to alpha for the unknown value %p',
    (value) => {
      expect(parseSolanaVersion(value)).toBe('alpha')
    },
  )
})

describe('isSolanaBetaOrHigher', () => {
  it.each`
    version    | expected
    ${'alpha'} | ${false}
    ${'beta'}  | ${true}
    ${'ga'}    | ${true}
  `('is $expected for $version', ({ version, expected }) => {
    expect(isSolanaBetaOrHigher(version)).toBe(expected)
  })
})
