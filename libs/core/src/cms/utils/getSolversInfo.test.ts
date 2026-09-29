const mockCmsGet = jest.fn<Promise<unknown>, [string, unknown]>()
const cmsClientUrls: string[] = []

jest.mock('@cowprotocol/cms', () => ({
  CmsClient: ({ url }: { url: string }) => {
    cmsClientUrls.push(url)

    return { GET: mockCmsGet }
  },
}))

const BARN_CMS_BASE_URL = 'https://cms.barn.cow.fi/api'
const originalCmsBaseUrl = process.env.REACT_APP_CMS_BASE_URL

describe('getSolversInfo', () => {
  beforeEach(() => {
    mockCmsGet.mockReset()
    cmsClientUrls.length = 0
    jest.resetModules()
  })

  afterEach(() => {
    if (originalCmsBaseUrl === undefined) {
      delete process.env.REACT_APP_CMS_BASE_URL
    } else {
      process.env.REACT_APP_CMS_BASE_URL = originalCmsBaseUrl
    }
  })

  // The barn CMS has no `solver_networks` data, so solvers fetched from it render as raw addresses
  it('reads solvers from the production CMS even when the app points at the barn CMS', async () => {
    process.env.REACT_APP_CMS_BASE_URL = BARN_CMS_BASE_URL
    mockCmsGet.mockResolvedValue({ data: { data: [] } })

    const { getSolversInfo } = await import('./getSolversInfo')

    await getSolversInfo()

    expect(cmsClientUrls).toEqual(['https://cms.cow.fi/api'])
  })
})
