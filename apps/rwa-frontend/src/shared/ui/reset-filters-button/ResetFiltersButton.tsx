import type { ReactNode } from 'react'

import styles from './ResetFiltersButton.module.css'

interface ResetFiltersButtonProps {
  variant?: 'regular' | 'small'
  onClick(): void
}

export function ResetFiltersButton({ variant = 'regular', onClick }: ResetFiltersButtonProps): ReactNode {
  return (
    <button type="button" className={`${styles.button} ${variant === 'small' ? styles.small : ''}`} onClick={onClick}>
      Reset filters
    </button>
  )
}
