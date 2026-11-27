'use client'

import { type ReactNode, Suspense } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import styles from './AssetView.module.css'

import { ASSET_FROM_SEARCH_PARAM, type AssetPageOrigin } from '@/entities/asset'

const BACK_TARGETS: Record<AssetPageOrigin | 'explore', { href: string; label: string }> = {
  explore: { href: '/', label: 'Explore' },
  portfolio: { href: '/portfolio', label: 'Portfolio' },
}

/** Back to the page that opened the asset (`ASSET_FROM_SEARCH_PARAM`), Explore by default */
export function AssetBackLink(): ReactNode {
  return (
    <Suspense fallback={<BackLink origin="explore" />}>
      <SearchParamsBackLink />
    </Suspense>
  )
}

function ArrowLeftIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12.667 8H3.333M8 12.667 3.333 8 8 3.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackLink({ origin }: { origin: keyof typeof BACK_TARGETS }): ReactNode {
  const { href, label } = BACK_TARGETS[origin]

  return (
    <Link className={styles.back} href={href}>
      <ArrowLeftIcon />
      {label}
    </Link>
  )
}

function SearchParamsBackLink(): ReactNode {
  const from = useSearchParams().get(ASSET_FROM_SEARCH_PARAM)

  return <BackLink origin={from === 'portfolio' ? 'portfolio' : 'explore'} />
}
