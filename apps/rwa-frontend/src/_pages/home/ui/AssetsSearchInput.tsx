'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsSearchInput.module.css'

import { assetsSearchQueryAtom, setAssetsSearchQueryAtom } from '../model/assetsSearchQueryAtom'

export function AssetsSearchInput(): ReactNode {
  const query = useAtomValue(assetsSearchQueryAtom)
  const setQuery = useSetAtom(setAssetsSearchQueryAtom)

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
