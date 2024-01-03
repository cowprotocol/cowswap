import { getProviderByNetwork } from 'api/web3'

describe('getProviderByNetwork', () => {
  test('Use websockets when not in IOS 15.x', () => {
    jest
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValueOnce(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      )
    const providerUrl = getProviderByNetwork(1) || ''
    const protocol = providerUrl.split(':')[0]
    expect(protocol).toBe('wss')
  })

  test('Use https when using IOS 15.x', () => {
    jest
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValueOnce(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/167.0.382489606 Mobile/15E148 Safari/604.1',
      )
    const providerUrl = getProviderByNetwork(1) || ''
    const protocol = providerUrl.split(':')[0]
    expect(protocol).toBe('https')
  })
})
