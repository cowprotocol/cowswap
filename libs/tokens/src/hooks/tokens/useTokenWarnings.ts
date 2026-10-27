import { useMemo } from 'react'

import { SOLANA_TOKEN_WARNINGS_URL } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useIsRwaToken } from '../lists/useIsRwaToken'

export interface TokenWarning {
  type: string
  severity: TokenWarningSeverity
  message: string
}

export type TokenWarningSeverity = 'info' | 'warning' | 'critical'

interface StoredWarning {
  type: string
  severity: TokenWarningSeverity
}

/** Parsed from the CDN, so every field is treated as possibly absent. */
interface TokenWarningsFile {
  messages?: Record<string, string>
  warnings?: Record<string, StoredWarning[]>
}

const REFRESH_INTERVAL = ms`1h`
const ERROR_RETRY_COUNT = 3

const NO_WARNINGS: TokenWarning[] = []

/**
 * A tokenised equity has to let its issuer mint, freeze and claw back holdings — that is the
 * regulation it exists to satisfy, not a sign the token is unsafe. Shield reports them anyway, and
 * `HAS_PERMANENT_DELEGATE` at `critical` would put a red badge on most of the RWA list. They stay
 * visible, demoted to the severity that says "worth knowing" rather than "danger".
 */
const RWA_EXPECTED_TYPES = new Set(['HAS_PERMANENT_DELEGATE', 'HAS_FREEZE_AUTHORITY', 'HAS_MINT_AUTHORITY'])

// Worst first, so a badge built from the head of the list shows the severity that matters.
const SEVERITY_RANK: Record<TokenWarningSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

/** Joins each stored warning with its message and orders them worst severity first. */
export function toTokenWarnings(
  stored: StoredWarning[] | undefined,
  messages: Record<string, string> | undefined,
  isRwa = false,
): TokenWarning[] {
  if (!stored?.length) return NO_WARNINGS

  return stored
    .map(({ type, severity }) => ({
      type,
      severity: isRwa && RWA_EXPECTED_TYPES.has(type) ? 'info' : severity,
      message: messages?.[type] ?? '',
    }))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
}

/**
 * Risk warnings for a Solana mint, worst severity first.
 *
 * The file is published per mint by the `token-lists` repo, which also leaves native SOL out of it:
 * it is listed under the System Program id rather than a real mint, and the upstream check answers
 * for it with the defaults it gives any unknown address.
 */
export function useTokenWarnings(currency: Currency | null | undefined): TokenWarning[] {
  const address = currency && !getIsNativeToken(currency) ? currency.address : undefined
  const isSolana = !!currency && isSolanaChain(currency.chainId)
  const isRwa = useIsRwaToken(address ? { address } : undefined)

  const { data } = useSWR<TokenWarningsFile>(isSolana ? SOLANA_TOKEN_WARNINGS_URL : null, fetchTokenWarnings, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    // A fetch that never recovers leaves a flagged token looking clean, and an empty badge is
    // indistinguishable from "no warnings" — so this retries and revalidates on reconnect rather
    // than giving up. Neither blocks the form, which resolves independently of this.
    revalidateOnReconnect: true,
    errorRetryCount: ERROR_RETRY_COUNT,
  })

  return useMemo(
    () => toTokenWarnings(address ? data?.warnings?.[address] : undefined, data?.messages, isRwa),
    [data, address, isRwa],
  )
}

async function fetchTokenWarnings(url: string): Promise<TokenWarningsFile> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch token warnings: ${response.status}`)
  }

  return response.json()
}

// Remote data, so an unrecognised severity sorts last rather than poisoning the comparator with NaN.
function severityRank(severity: TokenWarningSeverity): number {
  return SEVERITY_RANK[severity] ?? SEVERITY_RANK.info
}
