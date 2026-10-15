import 'server-only'

import { type NewsFeedItem, parseNewsFeed } from './parseNewsFeed'

const REQUEST_TIMEOUT_MS = 10_000

const HEADERS = {
  accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
  'user-agent': 'CoW Protocol RWA (+https://cow.fi)',
}

export async function fetchNewsFeed(url: string, revalidateSeconds: number): Promise<NewsFeedItem[]> {
  const response = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: revalidateSeconds },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`News feed ${new URL(url).host} responded with ${response.status}`)

  return parseNewsFeed(await response.text())
}
