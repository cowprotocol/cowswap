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

describe('toTokenWarnings on an RWA token', () => {
  const ISSUER_PERMISSIONS = [
    { type: 'HAS_PERMANENT_DELEGATE', severity: 'critical' },
    { type: 'HAS_FREEZE_AUTHORITY', severity: 'warning' },
    { type: 'HAS_MINT_AUTHORITY', severity: 'info' },
  ] as const

  it('demotes the permissions a tokenised equity is required to have', () => {
    const result = toTokenWarnings([...ISSUER_PERMISSIONS], MESSAGES, true)

    expect(result.map((warning) => warning.severity)).toEqual(['info', 'info', 'info'])
  })

  it('keeps those warnings visible rather than dropping them', () => {
    const result = toTokenWarnings([...ISSUER_PERMISSIONS], MESSAGES, true)

    expect(result.map((warning) => warning.type).sort()).toEqual([
      'HAS_FREEZE_AUTHORITY',
      'HAS_MINT_AUTHORITY',
      'HAS_PERMANENT_DELEGATE',
    ])
  })

  it('leaves warnings that are not inherent to an RWA alone', () => {
    const result = toTokenWarnings(
      [
        { type: 'HAS_PERMANENT_DELEGATE', severity: 'critical' },
        { type: 'NOT_SELLABLE', severity: 'critical' },
      ],
      MESSAGES,
      true,
    )

    expect(result[0]).toMatchObject({ type: 'NOT_SELLABLE', severity: 'critical' })
    expect(result[1]).toMatchObject({ type: 'HAS_PERMANENT_DELEGATE', severity: 'info' })
  })

  it('does not demote anything for a non-RWA token', () => {
    const result = toTokenWarnings([...ISSUER_PERMISSIONS], MESSAGES, false)

    expect(result.map((warning) => warning.severity)).toEqual(['critical', 'warning', 'info'])
  })
})
