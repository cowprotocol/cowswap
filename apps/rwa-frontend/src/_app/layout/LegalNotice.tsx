import type { ReactNode } from 'react'

import styles from './LegalNotice.module.css'

const LEGAL_LINKS = [
  { title: 'Terms and Conditions', url: 'https://cow.fi/legal/cowswap-terms' },
  { title: 'Privacy Policy', url: 'https://cow.fi/legal/cowswap-privacy-policy' },
]

export function LegalNotice(): ReactNode {
  return (
    <aside className={styles.legal} aria-label="Legal">
      <ul className={styles.links}>
        {LEGAL_LINKS.map(({ title, url }) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.disclaimer}>
        CoW RWA provides access to information concerning third-party issued tokenized assets and supported onchain
        transaction functionality. Tokenized assets are issued by independent third parties and are subject to their
        respective terms and conditions. Tokens may not confer the rights attached to the underlying assets. The
        availability of an asset through this interface does not constitute a recommendation or endorsement of that
        asset.
      </p>
    </aside>
  )
}
