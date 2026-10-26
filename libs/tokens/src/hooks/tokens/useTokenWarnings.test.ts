import { toTokenWarnings } from './useTokenWarnings'

const MESSAGES = {
  HAS_FREEZE_AUTHORITY: 'The authority can freeze your token account',
  HAS_MINT_AUTHORITY: 'The authority can mint more tokens',
  NOT_SELLABLE: 'This token may not be sellable',
}

describe('toTokenWarnings', () => {
  it('returns nothing for a mint with no entry', () => {
    expect(toTokenWarnings(undefined, MESSAGES)).toEqual([])
  })

  it('returns nothing for an empty list', () => {
    expect(toTokenWarnings([], MESSAGES)).toEqual([])
  })

  it('joins each warning with its message', () => {
    expect(toTokenWarnings([{ type: 'HAS_MINT_AUTHORITY', severity: 'info' }], MESSAGES)).toEqual([
      { type: 'HAS_MINT_AUTHORITY', severity: 'info', message: MESSAGES.HAS_MINT_AUTHORITY },
    ])
  })

  it('orders worst severity first, so the badge takes its colour from the head', () => {
    const result = toTokenWarnings(
      [
        { type: 'HAS_MINT_AUTHORITY', severity: 'info' },
        { type: 'NOT_SELLABLE', severity: 'critical' },
        { type: 'HAS_FREEZE_AUTHORITY', severity: 'warning' },
      ],
      MESSAGES,
    )

    expect(result.map((warning) => warning.severity)).toEqual(['critical', 'warning', 'info'])
  })

  it('falls back to an empty message when the dictionary is missing the type', () => {
    expect(toTokenWarnings([{ type: 'BRAND_NEW_TYPE', severity: 'warning' }], MESSAGES)[0].message).toBe('')
    expect(toTokenWarnings([{ type: 'HAS_MINT_AUTHORITY', severity: 'info' }], undefined)[0].message).toBe('')
  })
})
