import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './RelatedAssets.module.css'

import type { RwaRelatedAsset } from '@/entities/asset'

import { TokenLogo } from '@/shared/ui/token-logo'

export function RelatedAssets({ assets }: { assets: RwaRelatedAsset[] }): ReactNode {
  if (!assets.length) return null

  return (
    <section className={styles.related} aria-labelledby="related-assets-title">
      <h2 id="related-assets-title">Related assets</h2>
      <ul className={styles.list}>
        {assets.map(({ ticker, title, logoUrl }) => (
          <li key={ticker}>
            <Link className={styles.item} href={`/asset/${ticker}`}>
              <TokenLogo symbol={ticker} logoUrl={logoUrl} />
              <span className={styles.name}>
                <span className={styles.title}>{title}</span>
                <span className={styles.ticker}>{ticker}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
