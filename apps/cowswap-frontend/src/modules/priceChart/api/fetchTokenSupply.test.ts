import { BFF_BASE_URL, NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchTokenSupply } from './fetchTokenSupply'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  fetchWithTimeout: jest.fn(),
}))

const mockedFetchWithTimeout = jest.mocked(fetchWithTimeout)

describe('fetchTokenSupply', () => {
  it.each([
    [NATIVE_CURRENCIES[SupportedChainId.MAINNET], '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
    [WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET], '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    [NATIVE_CURRENCIES[SupportedChainId.SOLANA], '11111111111111111111111111111111'],
  ])('fetches supply for %s without wrapping native currencies', async (currency, address) => {
    mockedFetchWithTimeout.mockResolvedValue({
      ok: true,
      json: async () => ({ circulatingSupply: 120, totalSupply: 150 }),
    } as Response)

    await expect(fetchTokenSupply(currency)).resolves.toEqual({
      circulatingSupply: 120,
      totalSupply: 150,
    })

    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      `${BFF_BASE_URL}/${currency.chainId}/tokens/${address}/supply`,
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })
})
