import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchTokenRestriction } from './fetchTokenRestriction'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  fetchWithTimeout: jest.fn(),
}))

const mockedFetchWithTimeout = jest.mocked(fetchWithTimeout)

const TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890'

function mockResponse(body: unknown, status = 200): void {
  mockedFetchWithTimeout.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response)
}

describe('fetchTokenRestriction', () => {
  it('requests the restriction of the token for the country', async () => {
    mockResponse({ restricted: false })

    await fetchTokenRestriction(SupportedChainId.MAINNET, TOKEN_ADDRESS, 'DE')

    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      `${BFF_BASE_URL}/get-token-restrictions/1/${TOKEN_ADDRESS}?countryCode=DE`,
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it.each([{ restricted: false }, { restricted: true, tokenList: 'xStocks Token List' }])(
    'returns %j',
    async (body) => {
      mockResponse(body)

      await expect(fetchTokenRestriction(SupportedChainId.MAINNET, TOKEN_ADDRESS, 'DE')).resolves.toEqual(body)
    },
  )

  // The BFF answers 503 instead of `restricted: false` while it has no restricted lists loaded
  it('rejects a failed response', async () => {
    mockResponse({ message: 'Restricted token lists unavailable' }, 503)

    await expect(fetchTokenRestriction(SupportedChainId.MAINNET, TOKEN_ADDRESS, 'DE')).rejects.toThrow('503')
  })

  it.each([{}, { restricted: 'false' }, { restricted: true }, null])('rejects an unexpected body %j', async (body) => {
    mockResponse(body)

    await expect(fetchTokenRestriction(SupportedChainId.MAINNET, TOKEN_ADDRESS, 'DE')).rejects.toThrow(
      'unexpected shape',
    )
  })
})
