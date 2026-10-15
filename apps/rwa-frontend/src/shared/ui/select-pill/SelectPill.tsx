import type { ComponentProps, ReactNode } from 'react'

import styles from './SelectPill.module.css'

import { ChevronDownIcon } from '@/shared/ui/icons'

interface SelectPillProps extends ComponentProps<'select'> {
  /** `regular` is 40px high, `small` 32px */
  variant?: 'regular' | 'small'
}

export function SelectPill({ className, variant = 'regular', ...props }: SelectPillProps): ReactNode {
  return (
    <span className={[styles.pill, variant === 'small' && styles.small, className].filter(Boolean).join(' ')}>
      <select className={styles.select} {...props} />
      <ChevronDownIcon className={styles.chevron} />
    </span>
  )
}
