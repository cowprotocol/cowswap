import { parseNewsFeed } from './parseNewsFeed'

describe('parseNewsFeed', () => {
  it('reads RSS 2.0 items', () => {
    const xml = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
        <title>NVIDIA Newsroom</title>
        <atom:link href="https://nvidianews.nvidia.com/releases.xml" rel="self" />
        <item>
          <title><![CDATA[NVIDIA & Palantir Bring <b>Sovereign</b> Intelligence]]></title>
          <link>https://nvidianews.nvidia.com/news/palantir</link>
          <pubDate>Thu, 10 Sep 2026 13:00:00 GMT</pubDate>
        </item>
        <item>
          <title>Results for Q2 &#8212; Fiscal 2027 &amp; more</title>
          <link>https://nvidianews.nvidia.com/news/q2</link>
          <dc:date>2026-08-26T20:20:00Z</dc:date>
        </item>
      </channel></rss>`

    expect(parseNewsFeed(xml)).toEqual([
      {
        title: 'NVIDIA & Palantir Bring Sovereign Intelligence',
        url: 'https://nvidianews.nvidia.com/news/palantir',
        publishedAt: '2026-09-10T13:00:00.000Z',
      },
      {
        title: 'Results for Q2 — Fiscal 2027 & more',
        url: 'https://nvidianews.nvidia.com/news/q2',
        publishedAt: '2026-08-26T20:20:00.000Z',
      },
    ])
  })

  it('reads Atom entries with the alternate link', () => {
    const xml = `<feed xmlns="http://www.w3.org/2005/Atom">
      <link href="https://www.apple.com/newsroom/rss-feed.rss" rel="self"/>
      <entry>
        <title type="html"><![CDATA[Apple unveils iPhone]]></title>
        <link rel="enclosure" href="https://www.apple.com/image.jpg"/>
        <link href="https://www.apple.com/newsroom/2026/09/iphone/"/>
        <updated>2026-09-09T17:00:00.000Z</updated>
        <published>2026-09-09T16:00:00.000Z</published>
      </entry>
    </feed>`

    expect(parseNewsFeed(xml)).toEqual([
      {
        title: 'Apple unveils iPhone',
        url: 'https://www.apple.com/newsroom/2026/09/iphone/',
        publishedAt: '2026-09-09T16:00:00.000Z',
      },
    ])
  })

  it('skips items without a title or an https link and keeps undated ones', () => {
    const xml = `<rss><channel>
      <item><title>No link</title></item>
      <item><title>Script</title><link>javascript:alert(1)</link></item>
      <item><title>Plain http</title><link>http://example.com/a</link></item>
      <item><link>https://example.com/untitled</link></item>
      <item><title>Undated</title><link>https://example.com/b</link><pubDate>soon</pubDate></item>
    </channel></rss>`

    expect(parseNewsFeed(xml)).toEqual([{ title: 'Undated', url: 'https://example.com/b', publishedAt: null }])
  })

  it('returns nothing for a non-feed document', () => {
    expect(parseNewsFeed('<!DOCTYPE html><html><head><title>IR</title></head></html>')).toEqual([])
  })
})
