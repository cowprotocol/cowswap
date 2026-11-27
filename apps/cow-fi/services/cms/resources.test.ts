import { client, getAllResources, getAllResourceSlugs, getCampaignSummaries, getResourceBySlug } from './index'

type ResourceAttributes = {
  campaign?: string
  slug?: string
}

function createCmsPage(
  items: unknown[],
  page: number,
  pageCount: number,
): {
  data: {
    data: Array<{ attributes: unknown }>
    meta: { pagination: { page: number; pageCount: number; pageSize: number; total: number } }
  }
  error: undefined
  response: { status: number; url: string }
} {
  return {
    data: {
      data: items.map((attributes) => ({ attributes })),
      meta: {
        pagination: {
          page,
          pageSize: 100,
          pageCount,
          total: items.length,
        },
      },
    },
    error: undefined,
    response: { status: 200, url: 'https://cms.cow.fi/api/resources' },
  }
}

function mockResourcePages(pages: ResourceAttributes[][]): void {
  jest.spyOn(client, 'GET').mockImplementation(async (_path, init) => {
    const query = (init as { params?: { query?: Record<string, unknown> } } | undefined)?.params?.query
    const page = Number(query?.['pagination[page]'] ?? 1)
    const items = pages[page - 1] ?? []

    return createCmsPage(items, page, pages.length) as never
  })
}

describe('resource CMS pagination', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('collects resource slugs from every CMS page', async () => {
    mockResourcePages([
      [{ campaign: 'tokens', slug: 'cow-token' }],
      [{ campaign: 'tokens', slug: 'usdc-guide' }],
      [{ campaign: 'intent-hooks', slug: 'hook-guide' }],
    ])

    await expect(getAllResourceSlugs()).resolves.toEqual([
      { campaign: 'tokens', slug: 'cow-token' },
      { campaign: 'tokens', slug: 'usdc-guide' },
      { campaign: 'intent-hooks', slug: 'hook-guide' },
    ])

    expect(client.GET).toHaveBeenCalledTimes(3)
    expect(client.GET).toHaveBeenNthCalledWith(
      1,
      '/resources',
      expect.objectContaining({
        params: {
          query: expect.objectContaining({
            'pagination[page]': 1,
            'pagination[pageSize]': 100,
            fields: ['slug', 'campaign'],
          }),
        },
      }),
    )
  })

  it('counts campaigns from every slug page', async () => {
    mockResourcePages([
      [
        { campaign: 'tokens', slug: 'cow-token' },
        { campaign: 'tokens', slug: 'usdc-guide' },
      ],
      [{ campaign: 'intent-hooks', slug: 'hook-guide' }],
    ])

    await expect(getCampaignSummaries()).resolves.toEqual([
      { campaign: 'intent-hooks', count: 1 },
      { campaign: 'tokens', count: 2 },
    ])
  })

  it('loads a campaign listing beyond the first CMS page', async () => {
    mockResourcePages([[{ campaign: 'tokens', slug: 'cow-token' }], [{ campaign: 'tokens', slug: 'usdc-guide' }]])

    const resources = await getAllResources({
      filters: {
        campaign: {
          $eq: 'tokens',
        },
      },
    })

    expect(resources.map((resource) => resource.attributes?.slug)).toEqual(['cow-token', 'usdc-guide'])
    expect(client.GET).toHaveBeenCalledTimes(2)
    expect(client.GET).toHaveBeenCalledWith(
      '/resources',
      expect.objectContaining({
        params: {
          query: expect.objectContaining({
            'pagination[page]': 2,
            filters: {
              campaign: {
                $eq: 'tokens',
              },
            },
          }),
        },
      }),
    )
  })

  it('distinguishes an incomplete lookup from a missing resource', async () => {
    const missing = createCmsPage([], 1, 0)
    const incomplete = createCmsPage([], 1, 1)
    incomplete.data.meta.pagination.total = 1

    jest
      .spyOn(client, 'GET')
      .mockResolvedValueOnce(incomplete as never)
      .mockResolvedValueOnce(missing as never)

    await expect(getResourceBySlug('cow-token')).rejects.toThrow('Invalid CMS response for slug cow-token')
    await expect(getResourceBySlug('cow-token')).resolves.toBeNull()
  })

  it.each([
    { shape: 'a string', attributes: 'invalid' },
    { shape: 'an array', attributes: [] },
    { shape: 'a boolean', attributes: true },
  ])('rejects $shape as resource attributes', async ({ attributes }) => {
    jest.spyOn(client, 'GET').mockResolvedValueOnce(createCmsPage([attributes], 1, 1) as never)

    await expect(getResourceBySlug('cow-token')).rejects.toThrow('Invalid CMS response for slug cow-token')
  })

  it('accepts resource attributes with no campaign', async () => {
    const attributes = { slug: 'cow-token' }
    jest.spyOn(client, 'GET').mockResolvedValueOnce(createCmsPage([attributes], 1, 1) as never)

    await expect(getResourceBySlug('cow-token')).resolves.toEqual({ attributes })
  })

  it('omits incomplete resources without using non-null assertions', async () => {
    mockResourcePages([
      [{ campaign: 'tokens', slug: 'kept' }, { campaign: 'tokens' }, { slug: 'missing-campaign' }, {}],
    ])

    await expect(getAllResourceSlugs()).resolves.toEqual([{ campaign: 'tokens', slug: 'kept' }])
  })
})
