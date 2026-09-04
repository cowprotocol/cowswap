import { normalizeEnsName } from './normalize'

describe('normalizeEnsName', () => {
  it('returns empty string for dot-less garbage input (not a valid ENS name shape)', () => {
    expect(normalizeEnsName('4'.repeat(100))).toBe('')
    expect(normalizeEnsName('notAnEnsName')).toBe('')
    expect(normalizeEnsName('0x1234567890123456789012345678901234567890')).toBe('')
  })

  it('returns empty string for empty/nullish input', () => {
    expect(normalizeEnsName('')).toBe('')
    expect(normalizeEnsName(undefined)).toBe('')
    expect(normalizeEnsName(null)).toBe('')
  })

  it('returns empty string for malformed dot placement', () => {
    expect(normalizeEnsName('.eth')).toBe('')
    expect(normalizeEnsName('vitalik.')).toBe('')
    expect(normalizeEnsName('vitalik..eth')).toBe('')
  })

  it('normalizes a well-formed ENS name', () => {
    expect(normalizeEnsName('vitalik.eth')).toBe('vitalik.eth')
  })
})
