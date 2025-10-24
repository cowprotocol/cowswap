import { sanitizeReferralCode, isReferralCodeLengthValid } from './code'

describe('sanitizeReferralCode', () => {
  it('uppercases and trims whitespace', () => {
    expect(sanitizeReferralCode(' abc ')).toBe('ABC')
  })

  it('removes non-alphanumeric characters', () => {
    expect(sanitizeReferralCode('a!b@c#1$2%3')).toBe('ABC123')
  })

  it('limits length to 16 characters', () => {
    expect(sanitizeReferralCode('ABCDEFGHIJKLMNOPQRSTUV')).toBe('ABCDEFGHIJKLMNOP')
  })

  it('returns empty string for falsy input', () => {
    expect(sanitizeReferralCode('')).toBe('')
  })
})

describe('isReferralCodeLengthValid', () => {
  it('accepts lengths between 4 and 16 inclusive', () => {
    expect(isReferralCodeLengthValid('ABCD')).toBe(true)
    expect(isReferralCodeLengthValid('ABCDEFGHIJKLMNOP')).toBe(true)
  })

  it('rejects codes shorter than 4 characters', () => {
    expect(isReferralCodeLengthValid('ABC')).toBe(false)
  })

  it('rejects codes longer than 16 characters', () => {
    expect(isReferralCodeLengthValid('ABCDEFGHIJKLMNOPQ')).toBe(false)
  })
})
