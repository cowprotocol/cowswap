import { getWarningTitle } from './TokenWarningsBadge.utils'

describe('getWarningTitle', () => {
  it('has a title for every code the generator can publish', () => {
    // Mirrors WARNING_CODES in token-lists/src/scripts/solanaWarnings/warnings.ts. A code published
    // without a title here renders as an untitled message, so the two lists have to stay in step.
    const publishedCodes = [
      'MINT',
      'FREEZE',
      'PERM_DEL',
      'CONCENTRATED',
      'LOW_LIQ',
      'LOW_ORGANIC',
      'LOW_VOLUME',
      'UNVERIFIED',
      'NO_SELL',
    ]

    const missing = publishedCodes.filter((code) => !getWarningTitle(code))

    expect(missing).toEqual([])
  })

  it('returns undefined for an unknown code, so the caller can fall back', () => {
    expect(getWarningTitle('BRAND_NEW_CODE')).toBeUndefined()
  })
})
