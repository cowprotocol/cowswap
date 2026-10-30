'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useId, useState } from 'react'

import styles from './AssetsFiltersPanel.module.css'

import {
  activePanelFiltersCountAtom,
  assetsFiltersAtom,
  NO_PANEL_FILTERS,
  updateAssetsFiltersAtom,
} from '../model/assetsFiltersAtoms'

import { getChainLabel } from '@/shared/lib/chain'
import { formatCompactUsd } from '@/shared/lib/format'
import { SearchIcon } from '@/shared/ui/icons'

/** Longer lists get a search, "Only" and the rest folded behind "+ N more", unless that hides one option */
const SHORT_LIST_SIZE = 6
const MARKET_CAP_THRESHOLDS = [null, 1_000_000, 10_000_000, 100_000_000]
const VOLUME_THRESHOLDS = [null, 100_000, 1_000_000, 10_000_000]

interface AssetsFiltersPanelProps {
  id: string
  hidden: boolean
  issuers: string[]
  chainIds: number[]
}

interface FilterOption<T> {
  value: T
  label: string
}

interface OptionsSectionProps<T> {
  title: string
  searchPlaceholder: string
  options: FilterOption<T>[]
  selected: T[]
  onChange(selected: T[]): void
}

interface ThresholdSectionProps {
  title: string
  thresholds: (number | null)[]
  value: number | null
  onChange(value: number | null): void
}

export function AssetsFiltersPanel({ id, hidden, issuers, chainIds }: AssetsFiltersPanelProps): ReactNode {
  const filters = useAtomValue(assetsFiltersAtom)
  const activeFilters = useAtomValue(activePanelFiltersCountAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)

  return (
    <div id={id} className={styles.panel} role="dialog" aria-label="Filters" hidden={hidden}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filters</h2>
        {activeFilters > 0 && (
          <button type="button" className={styles.textButton} onClick={() => updateFilters(NO_PANEL_FILTERS)}>
            Clear all
          </button>
        )}
      </div>
      <OptionsSection
        title="Issuer"
        searchPlaceholder="Search issuers…"
        options={issuers.map((issuer) => ({ value: issuer, label: issuer }))}
        selected={filters.issuers}
        onChange={(selected) => updateFilters({ issuers: selected })}
      />
      <OptionsSection
        title="Network"
        searchPlaceholder="Search networks…"
        options={chainIds.map((chainId) => ({ value: chainId, label: getChainLabel(chainId) }))}
        selected={filters.chainIds}
        onChange={(selected) => updateFilters({ chainIds: selected })}
      />
      <ThresholdSection
        title="Onchain market cap"
        thresholds={MARKET_CAP_THRESHOLDS}
        value={filters.minMarketCap}
        onChange={(value) => updateFilters({ minMarketCap: value })}
      />
      <ThresholdSection
        title="24h volume"
        thresholds={VOLUME_THRESHOLDS}
        value={filters.minVolume24h}
        onChange={(value) => updateFilters({ minVolume24h: value })}
      />
    </div>
  )
}

function OptionsSection<T extends string | number>({
  title,
  searchPlaceholder,
  options,
  selected,
  onChange,
}: OptionsSectionProps<T>): ReactNode {
  const headingId = useId()
  const [search, setSearch] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = options.length > SHORT_LIST_SIZE
  const needle = search.trim().toLowerCase()
  const matches = needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options
  const canFold = !needle && !isExpanded && matches.length > SHORT_LIST_SIZE + 1
  const visible = canFold ? matches.slice(0, SHORT_LIST_SIZE) : matches
  const folded = matches.slice(visible.length)

  const toggle = (value: T): void =>
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])

  if (!options.length) return null

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHeader}>
        <h3 id={headingId} className={styles.sectionTitle}>
          {title}
        </h3>
        {selected.length > 0 && (
          <span className={styles.sectionCount}>
            {selected.length} of {options.length}
          </span>
        )}
      </div>
      {isLong && (
        <label className={styles.search}>
          <SearchIcon />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      )}
      <ul className={styles.options}>
        {visible.map(({ value, label }) => (
          <li key={value} className={styles.option}>
            <label className={styles.optionLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selected.includes(value)}
                onChange={() => toggle(value)}
              />
              {label}
            </label>
            {isLong && (
              <button
                type="button"
                className={styles.onlyButton}
                aria-label={`Only ${label}`}
                onClick={() => onChange([value])}
              >
                Only
              </button>
            )}
          </li>
        ))}
      </ul>
      {folded.length > 0 && (
        <button type="button" className={styles.moreButton} onClick={() => setIsExpanded(true)}>
          + {folded.length} more: {folded.map(({ label }) => label).join(', ')}
        </button>
      )}
      {!matches.length && <p className={styles.empty}>No matches</p>}
    </section>
  )
}

function ThresholdSection({ title, thresholds, value, onChange }: ThresholdSectionProps): ReactNode {
  const headingId = useId()
  const name = useId()

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {title}
      </h3>
      <div className={styles.segments} role="radiogroup" aria-labelledby={headingId}>
        {thresholds.map((threshold) => (
          <label key={threshold ?? 'any'} className={styles.segment}>
            <input
              type="radio"
              name={name}
              className={styles.segmentInput}
              checked={value === threshold}
              onChange={() => onChange(threshold)}
            />
            {threshold === null ? 'Any' : `${formatCompactUsd(threshold)}+`}
          </label>
        ))}
      </div>
    </section>
  )
}
