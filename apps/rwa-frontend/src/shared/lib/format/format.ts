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
  maximumFractionDigits: 2,
})

export function formatCompactUsd(value: number | null | undefined): string {
  return value === null || value === undefined ? EMPTY_VALUE : compactUsdFormatter.format(value)
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

export function formatUsd(value: number | null | undefined): string {
  return value === null || value === undefined ? EMPTY_VALUE : usdFormatter.format(value)
}
