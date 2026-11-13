import { parseClaimCode } from './claimCode.utils'

describe('parseClaimCode', () => {
  it('keeps a bare code', () => {
    expect(parseClaimCode('ABC123')).toBe('ABC123')
  })

  it('trims surrounding whitespace', () => {
    expect(parseClaimCode('  ABC123 \n')).toBe('ABC123')
  })

  it('reads the code out of a pasted claim URL', () => {
    expect(parseClaimCode('https://swap.cow.fi/#/graffiti/claim?code=ABC123')).toBe('ABC123')
  })

  it('reads the code when the URL carries other params', () => {
    expect(parseClaimCode('https://swap.cow.fi/#/graffiti/claim?utm=qr&code=ABC123')).toBe('ABC123')
  })

  it('falls back to the raw text when a URL has no code param', () => {
    expect(parseClaimCode('https://swap.cow.fi/#/graffiti')).toBe('https://swap.cow.fi/#/graffiti')
  })

  it('returns empty for blank input', () => {
    expect(parseClaimCode('   ')).toBe('')
  })
})
