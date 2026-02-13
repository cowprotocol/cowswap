import { formatRefCode } from './affiliateProgramUtils'

describe('formatRefCode', () => {
  it('normalizes and validates referral code', () => {
    expect(formatRefCode(' abcde ')).toBe('ABCDE')
  })

  it('rejects short codes', () => {
    expect(formatRefCode('ABCD')).toBeUndefined()
  })

  it('rejects long codes', () => {
    expect(formatRefCode('ABCDEFGHIJKLMNOPQRSTU')).toBeUndefined()
  })

  it('rejects invalid characters', () => {
    expect(formatRefCode('ABCD!')).toBeUndefined()
  })
})
