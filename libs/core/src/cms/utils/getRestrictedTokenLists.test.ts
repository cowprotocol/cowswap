const mockCmsGet = jest.fn<Promise<unknown>, [string, unknown]>()

jest.mock('@cowprotocol/cms', () => ({
  CmsClient: () => ({ GET: mockCmsGet }),
}))

import { getRestrictedTokenLists } from './getRestrictedTokenLists'

const RESERVE_BNB_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/refs/heads/main/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'

describe('getRestrictedTokenLists', () => {
  beforeEach(() => {
    mockCmsGet.mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('falls back to Reserve Protocol BNB token list when the CMS request fails', async () => {
    mockCmsGet.mockRejectedValue(new Error('CMS down'))

    await expect(getRestrictedTokenLists()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Reserve Protocol BNB Token List',
          tokenListUrl: RESERVE_BNB_TOKEN_LIST_URL,
          restrictedCountries: expect.arrayContaining(['US']),
        }),
      ]),
    )
  })
})
