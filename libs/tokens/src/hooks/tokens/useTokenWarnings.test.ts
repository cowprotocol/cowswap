import { toTokenWarnings } from './useTokenWarnings'

const TYPES = {
  MINT: { severity: 'info', message: 'The authority can mint more tokens' },
  FREEZE: { severity: 'warning', message: 'The authority can freeze your token account' },
  PERM_DEL: { severity: 'critical', message: 'The owner can control this token in your wallet' },
  NO_SELL: { severity: 'critical', message: 'This token may not be sellable' },
} as const

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
    expect(toTokenWarnings(['MINT'], TYPES)).toEqual([{ code: 'MINT', severity: 'info', message: TYPES.MINT.message }])
  })

  it('orders worst severity first, so the badge takes its colour from the head', () => {
    const result = toTokenWarnings(['MINT', 'PERM_DEL', 'FREEZE'], TYPES)

    expect(result.map((warning) => warning.severity)).toEqual(['critical', 'warning', 'info'])
  })

  it('skips a code the dictionary does not describe rather than rendering it blank', () => {
    const result = toTokenWarnings(['MINT', 'BRAND_NEW_CODE'], TYPES)

    expect(result.map((warning) => warning.code)).toEqual(['MINT'])
  })
})

describe('toTokenWarnings on an RWA token', () => {
  const ISSUER_PERMISSIONS = ['PERM_DEL', 'FREEZE', 'MINT']

  it('demotes the permissions a tokenised equity is required to have', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, true)

    expect(result.map((warning) => warning.severity)).toEqual(['info', 'info', 'info'])
  })

  it('keeps those warnings visible rather than dropping them', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, true)

    expect(result.map((warning) => warning.code).sort()).toEqual(['FREEZE', 'MINT', 'PERM_DEL'])
  })

  it('leaves warnings that are not inherent to an RWA alone', () => {
    const result = toTokenWarnings(['PERM_DEL', 'NO_SELL'], TYPES, true)

    expect(result[0]).toMatchObject({ code: 'NO_SELL', severity: 'critical' })
    expect(result[1]).toMatchObject({ code: 'PERM_DEL', severity: 'info' })
  })

  it('does not demote anything for a non-RWA token', () => {
    const result = toTokenWarnings(ISSUER_PERMISSIONS, TYPES, false)

    expect(result.map((warning) => warning.severity)).toEqual(['critical', 'warning', 'info'])
  })
})
