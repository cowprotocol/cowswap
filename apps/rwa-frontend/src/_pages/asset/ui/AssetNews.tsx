'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetNews.module.css'

import { assetNewsQueryAtomFamily, type RwaAsset, type RwaNewsFeed, type RwaNewsItem } from '@/entities/asset'
import { formatDate } from '@/shared/lib/format'

const SKELETON_ITEMS = 3

export function AssetNews({ asset }: { asset: RwaAsset }): ReactNode {
  if (!asset.newsFeed) return null

  return <AssetNewsSection asset={asset} feed={asset.newsFeed} />
}

function AssetNewsSection({ asset, feed }: { asset: RwaAsset; feed: RwaNewsFeed }): ReactNode {
  const { data, error, isPending } = useAtomValue(assetNewsQueryAtomFamily(asset.ticker))

  if (error || data?.degraded) return null

  return (
    <section className={styles.news} aria-labelledby="asset-news-title">
      <h2 id="asset-news-title">{asset.title} news</h2>
      {isPending ? (
        <ul className={styles.list} aria-hidden="true">
          {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
            <li key={index} className={styles.skeleton} />
          ))}
        </ul>
      ) : data?.items.length ? (
        <ul className={styles.list}>
          {data.items.map((item) => (
            <NewsCard key={item.url} item={item} source={feed.source} />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No recent news from {feed.source}</p>
      )}
    </section>
  )
}

function NewsCard({ item, source }: { item: RwaNewsItem; source: string }): ReactNode {
  return (
    <li className={styles.item}>
      <a className={styles.title} href={item.url} target="_blank" rel="noopener noreferrer">
        {item.title} <span aria-hidden="true">↗</span>
      </a>
      <span className={styles.meta}>
        {source}
        {item.publishedAt && ` · ${formatDate(item.publishedAt)}`}
      </span>
    </li>
  )
}
