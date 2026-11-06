'use client'

import type { ReactNode } from 'react'

import styles from './OfflineBanner.module.css'

import { useIsOnline } from '@/shared/lib/online'

export function OfflineBanner(): ReactNode {
  const isOnline = useIsOnline()

  if (isOnline) return null

  return (
    <div className={styles.banner} role="status">
      You are offline. Showing the last saved data.
    </div>
  )
}
