import { getDoesMessageIncludeToken } from './getDoesMessageIncludeToken'

describe('getDoesMessageIncludeToken', () => {
  it('matches an EVM address regardless of its case', () => {
    const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

    expect(
      getDoesMessageIncludeToken('Token 0x6b175474e89094c44da98b954eedeac495271d0f is unsupported', tokenAddress),
    ).toBe(tokenAddress)
  })

  it('matches a Solana address followed by punctuation', () => {
    const tokenAddress = 'HcRLc9VDgjLeK154xDawfb1dmVJ98DoSqcwTHGqiDeJR'

    expect(
      getDoesMessageIncludeToken(`Token ${tokenAddress} is unsupported: Token-2022 transfer fee`, tokenAddress),
    ).toBe(tokenAddress)
  })

  it('does not match a Solana address with a different case', () => {
    expect(
      getDoesMessageIncludeToken(
        'Token hcrlc9vdgjlek154xdawfb1dmvj98dosqcwthgqidejr is unsupported',
        'HcRLc9VDgjLeK154xDawfb1dmVJ98DoSqcwTHGqiDeJR',
      ),
    ).toBeNull()
  })

  it('returns null when the message does not mention the token', () => {
    expect(
      getDoesMessageIncludeToken('Token 0xabc is unsupported', '0x6B175474E89094C44Da98b954EedeAC495271d0F'),
    ).toBeNull()
  })
})
