import { sanitizeReferralCode, isReferralCodeLengthValid } from './code'

describe('sanitizeReferralCode', () => {
  it('uppercases and trims whitespace', () => {
    expect(sanitizeReferralCode(' abc ')).toBe('ABC')
  })

  it('removes unsupported characters but keeps dashes and underscores', () => {
    expect(sanitizeReferralCode('a!b@c#1$2%3-_')).toBe('ABC123-_')
  })

  it('limits length to 12 characters', () => {
    expect(sanitizeReferralCode('ABCDEFGHIJKLMNO')).toBe('ABCDEFGHIJKL')
  })

  it('returns empty string for falsy input', () => {
    expect(sanitizeReferralCode('')).toBe('')
  })
})

describe('isReferralCodeLengthValid', () => {
  it('accepts lengths between 6 and 12 inclusive', () => {
    expect(isReferralCodeLengthValid('ABCDEF')).toBe(true)
    expect(isReferralCodeLengthValid('ABCDEFGHIJKL')).toBe(true)
  })

  it('rejects codes shorter than 6 characters', () => {
    expect(isReferralCodeLengthValid('ABCDE')).toBe(false)
  })

  it('rejects codes longer than 12 characters', () => {
    expect(isReferralCodeLengthValid('ABCDEFGHIJKLM')).toBe(false)
  })
})
