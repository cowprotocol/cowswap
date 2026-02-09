import { sanitizeReferralCode, isReferralCodeLengthValid } from './affiliateProgramUtils'

describe('sanitizeReferralCode', () => {
  it('uppercases and trims whitespace', () => {
    expect(sanitizeReferralCode(' abc ')).toBe('ABC')
  })

  it('removes unsupported characters but keeps dashes and underscores', () => {
    expect(sanitizeReferralCode('a!b@c#1$2%3-_')).toBe('ABC123-_')
  })

  it('limits length to 20 characters', () => {
    expect(sanitizeReferralCode('ABCDEFGHIJKLMNOPQRSTUV')).toBe('ABCDEFGHIJKLMNOPQRST')
  })

  it('returns empty string for falsy input', () => {
    expect(sanitizeReferralCode('')).toBe('')
  })
})

describe('isReferralCodeLengthValid', () => {
  it('accepts lengths between 5 and 20 inclusive', () => {
    expect(isReferralCodeLengthValid('ABCDE')).toBe(true)
    expect(isReferralCodeLengthValid('ABCDEFGHIJKLMNOPQRST')).toBe(true)
  })

  it('rejects codes shorter than 5 characters', () => {
    expect(isReferralCodeLengthValid('ABCD')).toBe(false)
  })

  it('rejects codes longer than 20 characters', () => {
    expect(isReferralCodeLengthValid('ABCDEFGHIJKLMNOPQRSTU')).toBe(false)
  })
})
