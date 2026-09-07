const mockCmsGet = jest.fn<Promise<unknown>, [string, unknown]>()
const cmsClientUrls: string[] = []

jest.mock('@cowprotocol/cms', () => ({
  CmsClient: ({ url }: { url: string }) => {
    cmsClientUrls.push(url)

    return { GET: mockCmsGet }
  },
}))

const RESERVE_BNB_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/1dbc095c95210f3342278acb8b865763a4d7d443/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'
const BARN_CMS_BASE_URL = 'https://cms.barn.cow.fi/api'
const CMS_ITEM = {
  id: 1,
  attributes: {
    name: 'Ondo Tokenized Stocks List',
    tokenListUrl: 'https://example.com/ondo.tokenlist.json',
    restrictedCountries: ['US'],
  },
}
const originalCmsBaseUrl = process.env.REACT_APP_CMS_BASE_URL

const expectsReserveBnbFallback = expect.arrayContaining([
  expect.objectContaining({
    name: 'Reserve Protocol BNB Token List',
    tokenListUrl: RESERVE_BNB_TOKEN_LIST_URL,
    restrictedCountries: expect.arrayContaining(['US']),
  }),
])

async function importGetRestrictedTokenLists(): Promise<typeof import('./getRestrictedTokenLists')> {
  return import('./getRestrictedTokenLists')
}

describe('getRestrictedTokenLists', () => {
  beforeEach(() => {
    mockCmsGet.mockReset()
    cmsClientUrls.length = 0
    globalThis.localStorage?.clear()
    jest.resetModules()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()

    if (originalCmsBaseUrl === undefined) {
      delete process.env.REACT_APP_CMS_BASE_URL
    } else {
      process.env.REACT_APP_CMS_BASE_URL = originalCmsBaseUrl
    }
  })

  it('falls back to Reserve Protocol BNB token list when the CMS request fails', async () => {
    mockCmsGet.mockRejectedValue(new Error('CMS down'))

    const { getRestrictedTokenLists } = await importGetRestrictedTokenLists()

    await expect(getRestrictedTokenLists()).resolves.toEqual(expectsReserveBnbFallback)
  })

  // openapi-fetch resolves non-2xx responses instead of rejecting: without a fallback here, an HTTP
  // error leaves the app with zero restricted lists, silently disabling RWA geoblocking
  it('falls back when the CMS answers with an error status instead of data', async () => {
    mockCmsGet.mockResolvedValue({ error: { status: 403 }, response: { ok: false, status: 403 } })

    const { getRestrictedTokenLists } = await importGetRestrictedTokenLists()

    await expect(getRestrictedTokenLists()).resolves.toEqual(expectsReserveBnbFallback)
  })

  // An empty collection leaves the app with zero restricted lists, which is the same end state as a
  // failed request, so it must not be treated as a valid answer and cached
  it('falls back when the CMS returns an empty collection', async () => {
    mockCmsGet.mockResolvedValue({ data: { data: [] }, response: { ok: true, status: 200 } })

    const { getRestrictedTokenLists } = await importGetRestrictedTokenLists()

    await expect(getRestrictedTokenLists()).resolves.toEqual(expectsReserveBnbFallback)
  })

  // The barn CMS returns 403 for the `restricted-token-lists` collection
  it('reads restricted token lists from the production CMS even when the app points at the barn CMS', async () => {
    process.env.REACT_APP_CMS_BASE_URL = BARN_CMS_BASE_URL
    mockCmsGet.mockResolvedValue({ data: { data: [CMS_ITEM] }, response: { ok: true, status: 200 } })

    const { getRestrictedTokenLists } = await importGetRestrictedTokenLists()

    await getRestrictedTokenLists()

    expect(cmsClientUrls).toEqual(['https://cms.cow.fi/api'])
  })
})
