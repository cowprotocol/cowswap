import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchTokenSupply } from './fetchTokenSupply'

jest.mock('@cowprotocol/common-utils', () => ({
  fetchWithTimeout: jest.fn(),
}))

const mockedFetchWithTimeout = jest.mocked(fetchWithTimeout)

describe('fetchTokenSupply', () => {
  it('fetches token supply through the BFF', async () => {
    mockedFetchWithTimeout.mockResolvedValue({
      ok: true,
      json: async () => ({ circulatingSupply: 120, totalSupply: 150 }),
    } as Response)

    await expect(
      fetchTokenSupply({
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        chainId: SupportedChainId.MAINNET,
        symbol: 'WETH',
      }),
    ).resolves.toEqual({ circulatingSupply: 120, totalSupply: 150 })

    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      `${BFF_BASE_URL}/1/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/supply`,
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })
})
