import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { RwaAsset, RwaAssetNews, RwaNewsItem } from '../model/types'

import { fetchNewsFeed } from '@/shared/api/index.server'

/** Same as the `/api/v1/news` cache max-age */
export const NEWS_FEED_REVALIDATE_SECONDS = 900
export const NEWS_ITEMS_LIMIT = 3

export async function getAssetNews(asset: RwaAsset): Promise<RwaAssetNews> {
  const feed = asset.newsFeed

  if (!feed) return { source: null, items: [], degraded: false }

  try {
    const items = await fetchNewsFeed(feed.url, NEWS_FEED_REVALIDATE_SECONDS)

    return { source: feed.source, items: latestNews(items), degraded: false }
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[rwa] Failed to load the ${asset.ticker} news feed`, error)

    return { source: feed.source, items: [], degraded: true }
  }
}

/** Feeds are usually newest first, but not always; undated items keep their order after the dated ones */
export function latestNews(items: RwaNewsItem[]): RwaNewsItem[] {
  return items
    .map((item, index) => ({ item, index, time: item.publishedAt ? Date.parse(item.publishedAt) : -Infinity }))
    .sort((a, b) => b.time - a.time || a.index - b.index)
    .slice(0, NEWS_ITEMS_LIMIT)
    .map(({ item }) => item)
}
