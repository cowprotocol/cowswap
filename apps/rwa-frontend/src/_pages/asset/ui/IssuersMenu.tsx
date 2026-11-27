'use client'

import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import styles from './IssuersMenu.module.css'

import { getIssuerLegalDocsUrl, type RwaToken } from '@/entities/asset'
import { getChainLabel } from '@/shared/lib/chain'
import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ChevronDownIcon } from '@/shared/ui/icons'
import { NetworkLogos } from '@/shared/ui/network-logos'

const ISSUERS_HINT =
  'Different issuers offer separate tokens referencing the same underlying asset. Rights, risks and restrictions may vary.'

interface IssuerGroup {
  issuer: string
  symbols: string[]
  networks: string[]
  legalDocsUrl: string | null
}

export function IssuersMenu({ tokens }: { tokens: RwaToken[] }): ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const groups = useMemo(() => groupByIssuer(tokens), [tokens])
  const chainIds = useMemo(() => [...new Set(tokens.map((token) => token.chainId))], [tokens])
  const close = useCallback(() => setIsOpen(false), [])

  useDismissOnOutsideInteraction(isOpen, [wrapperRef], close)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {groups.length} {groups.length === 1 ? 'issuer' : 'issuers'}
        <NetworkLogos chainIds={chainIds} />
        <ChevronDownIcon className={styles.chevron} />
      </button>
      <div id={menuId} className={styles.menu} hidden={!isOpen}>
        <p className={styles.hint}>{ISSUERS_HINT}</p>
        <ul className={styles.list}>
          {groups.map(({ issuer, symbols, networks, legalDocsUrl }) => (
            <li key={issuer} className={styles.item}>
              <span className={styles.issuer}>
                {issuer}
                <span className={styles.symbols}> · {symbols.join(', ')}</span>
              </span>
              <span className={styles.networks}>{networks.join(', ')}</span>
              {legalDocsUrl && (
                <a className={styles.legalDocs} href={legalDocsUrl} target="_blank" rel="noopener noreferrer">
                  Legal docs <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function groupByIssuer(tokens: RwaToken[]): IssuerGroup[] {
  const groups = new Map<string, { symbols: Set<string>; networks: Set<string> }>()

  for (const token of tokens) {
    const group = groups.get(token.issuer) ?? { symbols: new Set(), networks: new Set() }

    group.symbols.add(token.symbol)
    group.networks.add(getChainLabel(token.chainId))
    groups.set(token.issuer, group)
  }

  return [...groups].map(([issuer, { symbols, networks }]) => ({
    issuer,
    symbols: [...symbols],
    networks: [...networks],
    legalDocsUrl: getIssuerLegalDocsUrl(issuer),
  }))
}
