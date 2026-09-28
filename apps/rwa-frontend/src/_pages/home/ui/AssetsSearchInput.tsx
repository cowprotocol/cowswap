'use client'

import { useAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsSearchInput.module.css'

import { assetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'

export function AssetsSearchInput(): ReactNode {
  const [query, setQuery] = useAtom(assetsSearchQueryAtom)

  return (
    <input
      className={styles.search}
      type="search"
      placeholder="Search by ticker, name or token symbol"
      aria-label="Search assets"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
  )
}
