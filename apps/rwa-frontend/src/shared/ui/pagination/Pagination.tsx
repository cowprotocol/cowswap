import type { ReactNode } from 'react'

import { getPageItems } from './pageItems'
import styles from './Pagination.module.css'

import { ChevronDownIcon } from '@/shared/ui/icons'

const PAGE_LISTS = [
  { slots: 11, className: styles.wide },
  { slots: 7, className: styles.narrow },
  { slots: 5, className: styles.compact },
]

interface PageListProps {
  page: number
  totalPages: number
  slots: number
  className: string
  onChange(page: number): void
}

interface PaginationProps {
  page: number
  totalPages: number
  onChange(page: number): void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps): ReactNode {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.arrow}
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronDownIcon className={styles.previousIcon} />
      </button>
      {PAGE_LISTS.map(({ slots, className }) => (
        <PageList
          key={slots}
          page={page}
          totalPages={totalPages}
          slots={slots}
          className={className}
          onChange={onChange}
        />
      ))}
      <button
        type="button"
        className={styles.arrow}
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronDownIcon className={styles.nextIcon} />
      </button>
    </nav>
  )
}

function PageList({ page, totalPages, slots, className, onChange }: PageListProps): ReactNode {
  return (
    <ul className={`${styles.pages} ${className}`}>
      {getPageItems(page, totalPages, slots).map((item) => (
        <li key={item}>
          {typeof item === 'number' ? (
            <button
              type="button"
              className={styles.page}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ) : (
            <span className={styles.gap} aria-hidden="true">
              …
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
