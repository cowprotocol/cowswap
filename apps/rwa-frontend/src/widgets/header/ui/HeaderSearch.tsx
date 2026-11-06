'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePathname, useRouter } from 'next/navigation'

import styles from './HeaderSearch.module.css'

import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import { useDismissOnMediaQueryExit } from '../lib/useDismissOnMediaQueryExit'
import {
  debouncedHeaderSearchQueryAtom,
  headerSearchQueryAtom,
  headerSearchResultQueryAtom,
  setHeaderSearchQueryAtom,
} from '../model/headerSearchAtoms'

import { RWA_ASSET_TYPE_LABELS, type RwaAssetWithMarket } from '@/entities/asset'
import { trackEvent } from '@/shared/lib/analytics'
import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { CloseIcon, SearchIcon } from '@/shared/ui/icons'
import { TokenLogo } from '@/shared/ui/token-logo'

interface SearchComboboxProps {
  inputRef: RefObject<HTMLInputElement | null>
  onOpenAsset(): void
}

interface SearchSuggestionsProps {
  listboxId: string
  /** `undefined` while searching */
  items: RwaAssetWithMarket[] | undefined
  activeTicker: string | undefined
  onSelect(ticker: string): void
  onHover(index: number): void
}

const FULL_SCREEN_QUERY = '(max-width: 720px)'

export function HeaderSearch(): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const query = useAtomValue(headerSearchQueryAtom)
  const { rootRef, toggleRef, isFieldShown, setIsFieldShown } = useFieldToggle(inputRef)

  useSlashShortcut(inputRef, setIsFieldShown)
  useBodyScrollLock(isFieldShown, FULL_SCREEN_QUERY)

  const hideField = (): void => {
    setIsFieldShown(false)
    toggleRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={isFieldShown ? `${styles.root} ${styles.fieldShown}` : styles.root}>
      <button
        ref={toggleRef}
        className={styles.toggle}
        type="button"
        aria-label="Search"
        aria-expanded={isFieldShown}
        aria-controls={fieldId}
        onClick={() => setIsFieldShown(!isFieldShown)}
      >
        <SearchIcon />
      </button>
      <div id={fieldId} className={styles.panel}>
        <div className={styles.bar}>
          <SearchCombobox inputRef={inputRef} onOpenAsset={() => setIsFieldShown(false)} />
          <button className={styles.close} type="button" aria-label="Close search" onClick={hideField}>
            <CloseIcon />
          </button>
        </div>
        {!query && <p className={styles.hint}>Try NVIDIA, NVDA or a token address.</p>}
      </div>
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

function SearchCombobox({ inputRef, onOpenAsset }: SearchComboboxProps): ReactNode {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const query = useAtomValue(headerSearchQueryAtom)
  const setQuery = useSetAtom(setHeaderSearchQueryAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const items = useSuggestions(query)
  const activeItem = items?.[activeIndex]
  const isExpanded = isOpen && query.trim().length > 0

  useCloseOnClickOutside(containerRef, setIsOpen)

  const openAsset = (ticker: string): void => {
    setIsOpen(false)
    setActiveIndex(-1)
    onOpenAsset()
    inputRef.current?.blur()
    trackEvent('search_asset_select', { ticker, search_term: query.trim() })
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
      <SearchIcon className={styles.icon} />
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
          <TokenLogo symbol={item.ticker} logoUrl={item.logoUrl} />
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

function useFieldToggle(inputRef: RefObject<HTMLInputElement | null>): {
  rootRef: RefObject<HTMLDivElement | null>
  toggleRef: RefObject<HTMLButtonElement | null>
  isFieldShown: boolean
  setIsFieldShown(isShown: boolean): void
} {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  // The page the field was shown on: the header outlives navigation, so Back and Forward must hide it
  const [shownOn, setShownOn] = useState<string | null>(null)
  const isFieldShown = shownOn === pathname

  if (shownOn !== null && !isFieldShown) setShownOn(null)
  const setIsFieldShown = useCallback((isShown: boolean) => setShownOn(isShown ? pathname : null), [pathname])
  const hideField = useCallback(() => setShownOn(null), [])

  // The on-screen keyboard resizes the viewport when the field gets the focus
  useDismissOnOutsideInteraction(isFieldShown, [rootRef], hideField, false)
  useDismissOnMediaQueryExit(isFieldShown, FULL_SCREEN_QUERY, hideField)

  useEffect(() => {
    if (isFieldShown) inputRef.current?.focus()
  }, [inputRef, isFieldShown])

  useEffect(() => {
    if (!isFieldShown) return

    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      hideField()
      toggleRef.current?.focus()
    }

    // Capture, so the field hides before the menu's Escape listener, which skips handled events
    document.addEventListener('keydown', onKeyDown, true)

    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isFieldShown, hideField])

  return { rootRef, toggleRef, isFieldShown, setIsFieldShown }
}

/** On narrow screens the field is hidden, so it is shown first and focused once it renders */
function useSlashShortcut(
  inputRef: RefObject<HTMLInputElement | null>,
  setIsFieldShown: (isShown: boolean) => void,
): void {
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) return

      event.preventDefault()
      if (window.matchMedia(FULL_SCREEN_QUERY).matches) setIsFieldShown(true)
      inputRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [inputRef, setIsFieldShown])
}

/** `undefined` until the results of the current query arrive */
function useSuggestions(query: string): RwaAssetWithMarket[] | undefined {
  const debouncedQuery = useAtomValue(debouncedHeaderSearchQueryAtom)
  const { data, isPlaceholderData } = useAtomValue(headerSearchResultQueryAtom)

  if (!debouncedQuery || debouncedQuery !== query.trim() || isPlaceholderData) return undefined

  return data?.items
}
