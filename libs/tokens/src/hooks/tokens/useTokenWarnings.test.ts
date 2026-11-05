import { toTokenWarnings, toWarningTier } from './useTokenWarnings'

const TYPES = {
  MINT: { severity: 'info', message: 'The authority can mint more tokens' },
  FREEZE: { severity: 'warning', message: 'The authority can freeze your token account' },
  PERM_DEL: { severity: 'critical', message: 'The owner can control this token in your wallet' },
  NO_SELL: { severity: 'critical', message: 'This token may not be sellable' },
  UNVERIFIED: { severity: 'info', message: 'This token is not verified' },
} as const

describe('toWarningTier', () => {
  it('treats everything above info as serious', () => {
    expect(toWarningTier('critical')).toBe('serious')
    expect(toWarningTier('warning')).toBe('serious')
  })

  it('treats info as worth knowing', () => {
    expect(toWarningTier('info')).toBe('worthKnowing')
  })
})

describe('toTokenWarnings', () => {
  it('returns nothing for a mint with no entry', () => {
    expect(toTokenWarnings(undefined, TYPES)).toEqual([])
  })

  it('returns nothing for an empty list', () => {
    expect(toTokenWarnings([], TYPES)).toEqual([])
  })

  it('returns nothing when the type dictionary is missing', () => {
    expect(toTokenWarnings(['MINT'], undefined)).toEqual([])
  })

  it('resolves each code against the shared dictionary', () => {
    expect(toTokenWarnings(['MINT'], TYPES)).toEqual([
      { code: 'MINT', severity: 'info', tier: 'worthKnowing', message: TYPES.MINT.message },
    ])
  })

  it('orders serious before worth knowing, worst severity first within a tier', () => {
    const result = toTokenWarnings(['MINT', 'PERM_DEL', 'FREEZE'], TYPES)

    expect(result.map((warning) => warning.code)).toEqual(['PERM_DEL', 'FREEZE', 'MINT'])
    expect(result.map((warning) => warning.tier)).toEqual(['serious', 'serious', 'worthKnowing'])
  })

  it('skips a code the dictionary does not describe rather than rendering it blank', () => {
    const result = toTokenWarnings(['MINT', 'BRAND_NEW_CODE'], TYPES)

    expect(result.map((warning) => warning.code)).toEqual(['MINT'])
  })

  it('renders a repeated code once', () => {
    expect(toTokenWarnings(['MINT', 'MINT'], TYPES).map((warning) => warning.code)).toEqual(['MINT'])
  })

  it('treats a severity it does not know as worth knowing rather than serious', () => {
    const types = { ODD: { severity: 'catastrophic', message: 'Something new' } } as unknown as typeof TYPES

    expect(toTokenWarnings(['ODD'], types)).toEqual([
      { code: 'ODD', severity: 'info', tier: 'worthKnowing', message: 'Something new' },
    ])
  })

  it('drops "not verified", which is true of every token that reaches this code', () => {
    expect(toTokenWarnings(['UNVERIFIED'], TYPES)).toEqual([])
    expect(toTokenWarnings(['UNVERIFIED', 'MINT'], TYPES).map((warning) => warning.code)).toEqual(['MINT'])
  })
})

describe('toTokenWarnings on an RWA token', () => {
  const ISSUER_PERMISSIONS = ['PERM_DEL', 'FREEZE', 'MINT']

  it('demotes the permissions a tokenised equity is required to have', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, true)

    expect(result.map((warning) => warning.severity)).toEqual(['info', 'info', 'info'])
  })

  it('demotes them out of the serious tier, so no checkbox is demanded for them', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, true)

    expect(result.map((warning) => warning.tier)).toEqual(['worthKnowing', 'worthKnowing', 'worthKnowing'])
  })

  it('keeps those warnings visible rather than dropping them', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, true)

    expect(result.map((warning) => warning.code).sort()).toEqual(['FREEZE', 'MINT', 'PERM_DEL'])
  })

  it('leaves warnings that are not inherent to an RWA alone', () => {
    const result = toTokenWarnings(['PERM_DEL', 'NO_SELL'], TYPES, true)

    expect(result[0]).toMatchObject({ code: 'NO_SELL', severity: 'critical', tier: 'serious' })
    expect(result[1]).toMatchObject({ code: 'PERM_DEL', severity: 'info', tier: 'worthKnowing' })
  })

  it('does not demote anything for a non-RWA token', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, false)

    expect(result.map((warning) => warning.severity)).toEqual(['critical', 'warning', 'info'])
  })
})
