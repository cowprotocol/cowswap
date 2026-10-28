import { useMemo } from 'react'

import { SOLANA_TOKEN_WARNINGS_URL } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useIsRwaToken } from '../lists/useIsRwaToken'

export interface TokenWarning {
  code: string
  severity: TokenWarningSeverity
  message: string
}

export type TokenWarningSeverity = 'info' | 'warning' | 'critical'

/** Parsed from the CDN, so every field is treated as possibly absent. */
interface TokenWarningsFile {
  types?: Record<string, WarningType>
  warnings?: Record<string, string[]>
}

interface WarningType {
  severity: TokenWarningSeverity
  message: string
}

const REFRESH_INTERVAL = ms`1h`
const ERROR_RETRY_COUNT = 3

const NO_WARNINGS: TokenWarning[] = []

/**
 * A tokenised equity has to let its issuer mint, freeze and claw back holdings — that is the
 * regulation it exists to satisfy, not a sign the token is unsafe. Shield reports them anyway, and
 * `PERM_DEL` at `critical` would put a red badge on most of the RWA list. They stay visible,
 * demoted to the severity that says "worth knowing" rather than "danger".
 */
const RWA_EXPECTED_CODES = new Set(['PERM_DEL', 'FREEZE', 'MINT'])

// Worst first, so a badge built from the head of the list shows the severity that matters.
const SEVERITY_RANK: Record<TokenWarningSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

/** Resolves each published code against the shared type dictionary, worst severity first. */
export function toTokenWarnings(
  codes: string[] | undefined,
  types: Record<string, WarningType> | undefined,
  isRwa = false,
): TokenWarning[] {
  if (!codes?.length || !types) return NO_WARNINGS

  return codes
    .reduce<TokenWarning[]>((warnings, code) => {
      const type = types[code]

      // A code the dictionary does not describe cannot be rendered, and inventing copy for it
      // would be worse than staying quiet.
      if (type) {
        warnings.push({
          code,
          severity: isRwa && RWA_EXPECTED_CODES.has(code) ? 'info' : type.severity,
          message: type.message,
        })
      }

      return warnings
    }, [])
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
    () => toTokenWarnings(address ? data?.warnings?.[address] : undefined, data?.types, isRwa),
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
