import { getQuoteUnsupportedTokenReason } from './getQuoteUnsupportedTokenReason'

describe('getQuoteUnsupportedTokenReason', () => {
  it('returns the reason following the token address', () => {
    expect(
      getQuoteUnsupportedTokenReason(
        'Token HcRLc9VDgjLeK154xDawfb1dmVJ98DoSqcwTHGqiDeJR is unsupported: Token-2022 transfer fee',
      ),
    ).toBe('Token-2022 transfer fee')
  })

  it('returns undefined when the description has no reason', () => {
    expect(
      getQuoteUnsupportedTokenReason('Token 0x6b175474e89094c44da98b954eedeac495271d0f is unsupported'),
    ).toBeUndefined()
  })

  it('returns undefined when the reason is blank', () => {
    expect(getQuoteUnsupportedTokenReason('Token 0xabc is unsupported:   ')).toBeUndefined()
  })
})
