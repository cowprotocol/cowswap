import { EMPTY_VALUE, formatCompactUsd } from '@/shared/lib/format'

/** CoinGecko reports `0` for a token it doesn't index, so `0` reads as missing */
export function formatTokenStat(value: number | null | undefined): string {
  return value ? formatCompactUsd(value) : EMPTY_VALUE
}
