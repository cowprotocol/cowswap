'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type KeyboardEvent, type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import styles from './HeaderSearch.module.css'

import {
  debouncedHeaderSearchQueryAtom,
  headerSearchQueryAtom,
  headerSearchResultQueryAtom,
  setHeaderSearchQueryAtom,
} from '../model/headerSearchAtoms'

import { getReferenceLogoUrl, RWA_ASSET_TYPE_LABELS, type RwaAssetWithMarket } from '@/entities/asset'
import { TokenLogo } from '@/shared/ui/token-logo'

interface SearchSuggestionsProps {
  listboxId: string
  /** `undefined` while searching */
  items: RwaAssetWithMarket[] | undefined
  activeTicker: string | undefined
  onSelect(ticker: string): void
  onHover(index: number): void
}

export function HeaderSearch(): ReactNode {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const query = useAtomValue(headerSearchQueryAtom)
  const setQuery = useSetAtom(setHeaderSearchQueryAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const items = useSuggestions(query)
  const activeItem = items?.[activeIndex]
  const isExpanded = isOpen && query.trim().length > 0

  useSlashShortcut(inputRef)
  useCloseOnClickOutside(containerRef, setIsOpen)

  const openAsset = (ticker: string): void => {
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
    router.push(`/asset/${ticker}`)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const count = items?.length ?? 0

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)

      if (!count) return

      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + step + count) % count)
    } else if (event.key === 'Enter') {
      const item = activeItem ?? items?.[0]

      if (isExpanded && item) openAsset(item.ticker)
    } else if (event.key === 'Escape') {
      // Search inputs clear themselves on Escape, the query must stay
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={styles.search}>
      <SearchIcon />
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        role="combobox"
        placeholder="Search name, ticker or address…"
        aria-label="Search assets"
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls={listboxId}
        aria-activedescendant={isExpanded && activeItem ? optionId(listboxId, activeItem.ticker) : undefined}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
      />
      {!query && (
        <kbd className={styles.shortcut} aria-hidden="true">
          /
        </kbd>
      )}
      {isExpanded && (
        <div className={styles.popup}>
          <SearchSuggestions
            listboxId={listboxId}
            items={items}
            activeTicker={activeItem?.ticker}
            onSelect={openAsset}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  )
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function optionId(listboxId: string, ticker: string): string {
  return `${listboxId}-${ticker}`
}

function SearchIcon(): ReactNode {
  return (
    <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchSuggestions({ listboxId, items, activeTicker, onSelect, onHover }: SearchSuggestionsProps): ReactNode {
  const query = useAtomValue(debouncedHeaderSearchQueryAtom)
  const { error } = useAtomValue(headerSearchResultQueryAtom)

  if (error && !items) return <p className={styles.status}>Search failed: {error.message}</p>
  if (!items) return <p className={styles.status}>Searching…</p>
  if (!items.length) return <p className={styles.status}>Nothing found for “{query}”</p>

  return (
    <ul id={listboxId} className={styles.listbox} role="listbox" aria-label="Assets">
      {items.map((item, index) => (
        <li
          key={item.ticker}
          id={optionId(listboxId, item.ticker)}
          className={styles.option}
          role="option"
          aria-selected={item.ticker === activeTicker}
          // Keeps the focus on the input, so the click does not close the popup first
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => onHover(index)}
          onClick={() => onSelect(item.ticker)}
        >
          <TokenLogo symbol={item.ticker} logoUrl={getReferenceLogoUrl(item, item.market)} />
          <span className={styles.optionText}>
            <span className={styles.optionTitle}>{item.title}</span>
            <span className={styles.optionMeta}>
              {item.ticker} · {RWA_ASSET_TYPE_LABELS[item.type]}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function useCloseOnClickOutside(ref: RefObject<HTMLElement | null>, setIsOpen: (isOpen: boolean) => void): void {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)

    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, setIsOpen])
}

function useSlashShortcut(inputRef: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return

      event.preventDefault()
      inputRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [inputRef])
}

/** `undefined` until the results of the current query arrive */
function useSuggestions(query: string): RwaAssetWithMarket[] | undefined {
  const debouncedQuery = useAtomValue(debouncedHeaderSearchQueryAtom)
  const { data, isPlaceholderData } = useAtomValue(headerSearchResultQueryAtom)

  if (!debouncedQuery || debouncedQuery !== query.trim() || isPlaceholderData) return undefined

  return data?.items
}
