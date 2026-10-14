import { formatUnits } from 'viem'

const EMPTY_VALUE = '—'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  // Node 22 ICU keeps the currency's 2-digit minimum under compact notation ("$526.00M")
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const tokenAmountFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export function formatCompactUsd(value: number | null | undefined): string {
  return value === null || value === undefined ? EMPTY_VALUE : compactUsdFormatter.format(value)
}

/** `timestamp` is in Unix seconds */
export function formatDateTime(timestamp: number | null | undefined): string {
  return timestamp === null || timestamp === undefined ? EMPTY_VALUE : dateTimeFormatter.format(timestamp * 1000)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE

  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(2)}%`
}

export function formatRange(low: number | null | undefined, high: number | null | undefined): string {
  if (low === null || low === undefined || high === null || high === undefined) return EMPTY_VALUE

  return `${formatUsd(low)} – ${formatUsd(high)}`
}

/** `atoms` is a decimal string of the token's smallest units */
export function formatTokenAmount(atoms: string, decimals: number | null | undefined): string {
  if (decimals === null || decimals === undefined) return EMPTY_VALUE

  return tokenAmountFormatter.format(toTokenUnits(atoms, decimals))
}

export function formatUsd(value: number | null | undefined): string {
  return value === null || value === undefined ? EMPTY_VALUE : usdFormatter.format(value)
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/** `atoms` is a decimal string of the token's smallest units */
export function toTokenUnits(atoms: string, decimals: number): number {
  return Number(formatUnits(BigInt(atoms), decimals))
}
