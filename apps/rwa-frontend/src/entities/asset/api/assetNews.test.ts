/**
 * @jest-environment node
 */
import { getAssetNews, latestNews } from './assetNews'

import type { RwaAsset, RwaNewsItem } from '../model/types'

import { fetchNewsFeed } from '@/shared/api/index.server'

jest.mock('@/shared/api/index.server', () => ({ fetchNewsFeed: jest.fn() }))

const fetchNewsFeedMock = jest.mocked(fetchNewsFeed)

const ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 0,
  newsFeed: { source: 'NVIDIA Newsroom', url: 'https://nvidianews.nvidia.com/releases.xml' },
  tokens: [],
}

function item(title: string, publishedAt: string | null): RwaNewsItem {
  return { title, url: `https://example.com/${title}`, publishedAt }
}

describe('latestNews', () => {
  it('keeps the 3 newest items, undated ones last in feed order', () => {
    const items = [
      item('undated-1', null),
      item('old', '2026-08-01T00:00:00.000Z'),
      item('newest', '2026-09-14T00:00:00.000Z'),
      item('undated-2', null),
      item('newer', '2026-09-10T00:00:00.000Z'),
    ]

    expect(latestNews(items).map(({ title }) => title)).toEqual(['newest', 'newer', 'old'])
    expect(latestNews(items.slice(0, 1).concat(items.slice(3, 4))).map(({ title }) => title)).toEqual([
      'undated-1',
      'undated-2',
    ])
  })
})

describe('getAssetNews', () => {
  beforeEach(() => fetchNewsFeedMock.mockReset())

  it('returns no news for an asset without a feed', async () => {
    expect(await getAssetNews({ ...ASSET, newsFeed: undefined })).toEqual({ source: null, items: [], degraded: false })
    expect(fetchNewsFeedMock).not.toHaveBeenCalled()
  })

  it('returns the latest items with the feed source', async () => {
    fetchNewsFeedMock.mockResolvedValue([item('a', '2026-09-14T00:00:00.000Z')])

    expect(await getAssetNews(ASSET)).toEqual({
      source: 'NVIDIA Newsroom',
      items: [item('a', '2026-09-14T00:00:00.000Z')],
      degraded: false,
    })
  })

  it('degrades when the feed fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    fetchNewsFeedMock.mockRejectedValue(new Error('403'))

    expect(await getAssetNews(ASSET)).toEqual({ source: 'NVIDIA Newsroom', items: [], degraded: true })
  })
})
