import { type ReactNode, useId } from 'react'

import styles from './DividendNotes.module.css'

import { getDividendNotes } from '../model/issuers'

import type { RwaToken } from '../model/types'

import { InfoIcon } from '@/shared/ui/icons'

interface DividendNotesProps {
  /** One note per distinct dividend scheme among them, nothing when none has a known issuer */
  tokens: Pick<RwaToken, 'issuer' | 'coingeckoId'>[]
  id?: string
  className?: string
}

export function DividendNotes({ tokens, id, className }: DividendNotesProps): ReactNode {
  const titleId = useId()
  const notes = getDividendNotes(tokens)

  if (!notes.length) return null

  return (
    <aside id={id} className={className ? `${styles.notes} ${className}` : styles.notes} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        <InfoIcon className={styles.icon} />
        How dividends reach holders
      </h3>
      <dl className={styles.list}>
        {notes.map(({ label, scheme, text }) => (
          <div key={label} className={styles.item}>
            <dt className={styles.term}>
              <span className={styles.label}>{label}</span>
              <span className={styles.scheme}>{scheme}</span>
            </dt>
            <dd className={styles.text}>{text}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
