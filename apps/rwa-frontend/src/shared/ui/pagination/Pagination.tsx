import type { ReactNode } from 'react'

import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onChange(page: number): void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps): ReactNode {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
