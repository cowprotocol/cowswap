import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { SOLANA_TOKEN_WARNINGS_URL } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import ms from 'ms.macro'
import useSWR from 'swr'

import { activeTokensMapAtom } from '../../state/tokens/allTokensAtom'
import { useIsRwaToken, useRwaTokenAddresses } from '../lists/useIsRwaToken'

export interface TokenWarning {
  code: string
  severity: TokenWarningSeverity
  tier: TokenWarningTier
  message: string
}

export type TokenWarningSeverity = 'info' | 'warning' | 'critical'

export interface TokenWarningsInfo {
  warnings: TokenWarning[]
  seriousWarnings: TokenWarning[]
  /** When the published file was generated, for the freshness line. */
  updatedAt: string | undefined
  isLoading: boolean
}

/** What the interface shows. `serious` can cost you the tokens; `worthKnowing` never blocks. */
export type TokenWarningTier = 'serious' | 'worthKnowing'

/** Parsed from the CDN, so every field is treated as possibly absent. */
interface TokenWarningsFile {
  timestamp?: string
  types?: Record<string, WarningType>
  warnings?: Record<string, string[]>
}

interface TokenWarningsFileState {
  types: Record<string, WarningType> | undefined
  timestamp: string | undefined
  codesByAddressKey: Record<string, string[]> | undefined
  isLoading: boolean
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

/**
 * Jupiter reports "not verified" for every mint outside its verified set, which is every mint the
 * interface can reach this code for: a listed token never gets here, and an imported one is
 * unverified by definition. Counting it would add a risk to every token and say nothing.
 */
const EXCLUDED_CODES = new Set(['UNVERIFIED'])

// Worst first, so a count built from the head of the list shows the severity that matters.
const SEVERITY_RANK: Record<TokenWarningSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

const TIER_RANK: Record<TokenWarningTier, number> = {
  serious: 0,
  worthKnowing: 1,
}

/** Resolves each published code against the shared type dictionary, worst tier first. */
export function toTokenWarnings(
  codes: string[] | undefined,
  types: Record<string, WarningType> | undefined,
  isRwa = false,
): TokenWarning[] {
  if (!codes?.length || !types) return NO_WARNINGS

  // The published list can repeat a code; rendering it twice would double the count and collide on
  // the React key, which is the code itself.
  return Array.from(new Set(codes))
    .reduce<TokenWarning[]>((warnings, code) => {
      const type = types[code]

      // A code the dictionary does not describe cannot be rendered, and inventing copy for it
      // would be worse than staying quiet.
      if (type && !EXCLUDED_CODES.has(code)) {
        const severity = isRwa && RWA_EXPECTED_CODES.has(code) ? 'info' : toSeverity(type.severity)

        warnings.push({ code, severity, tier: toWarningTier(severity), message: type.message })
      }

      return warnings
    }, [])
    .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
}

/**
 * The published file carries Shield's three severities; the interface shows two tiers.
 * `info` is what Jupiter reports for things that are worth reading and cannot take the tokens
 * away, so it is the line between them.
 */
export function toWarningTier(severity: TokenWarningSeverity): TokenWarningTier {
  return severity === 'info' ? 'worthKnowing' : 'serious'
}

/**
 * Risk warnings for a Solana mint, worst tier first.
 *
 * The file is published per mint by the `token-lists` repo, which also leaves native SOL out of it:
 * it is listed under the System Program id rather than a real mint, and the upstream check answers
 * for it with the defaults it gives any unknown address.
 */
export function useTokenWarnings(currency: Currency | null | undefined): TokenWarningsInfo {
  const address = currency && !getIsNativeToken(currency) ? currency.address : undefined
  const isSolana = !!currency && isSolanaChain(currency.chainId)
  const isRwa = useIsRwaToken(address ? { address } : undefined)
  const listedTokens = useAtomValue(activeTokensMapAtom)
  const { types, timestamp, codesByAddressKey, isLoading } = useTokenWarningsFile(isSolana)

  const isListed = !!address && !!listedTokens[getAddressKey(address)]

  return useMemo(
    () => toWarningsInfo(address, types, timestamp, codesByAddressKey, isRwa, isListed, isSolana && isLoading),
    [address, types, timestamp, codesByAddressKey, isRwa, isListed, isSolana, isLoading],
  )
}

/**
 * The same answer for several tokens at once.
 *
 * Import can be reached with both sides of a trade unlisted (a deep link naming two unknown
 * mints), and a hook cannot be called per element of a list — so the resolution is done here
 * rather than by calling `useTokenWarnings` in a loop. The returned array is rebuilt on every
 * render, so this is for the import modal, not the trade form.
 */
export function useTokenWarningsList(currencies: readonly Currency[]): TokenWarningsInfo[] {
  const hasSolanaToken = currencies.some((currency) => isSolanaChain(currency.chainId))
  const rwaAddresses = useRwaTokenAddresses()
  const listedTokens = useAtomValue(activeTokensMapAtom)
  const { types, timestamp, codesByAddressKey, isLoading } = useTokenWarningsFile(hasSolanaToken)

  return currencies.map((currency) => {
    const address = getIsNativeToken(currency) ? undefined : currency.address
    const isSolana = isSolanaChain(currency.chainId)
    const addressKey = address ? getAddressKey(address) : undefined
    const isRwa = !!addressKey && rwaAddresses.has(addressKey)
    const isListed = !!addressKey && !!listedTokens[addressKey]

    return toWarningsInfo(address, types, timestamp, codesByAddressKey, isRwa, isListed, isSolana && isLoading)
  })
}

async function fetchTokenWarnings(url: string): Promise<TokenWarningsFile> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch token warnings: ${response.status}`)
  }

  return response.json()
}

/**
 * The published file is keyed by whatever the generator wrote; every other address map in the app
 * is keyed by `getAddressKey`. Re-keying once here keeps a mint that differs only in form from
 * silently reading as "no risks".
 */
function toCodesByAddressKey(warnings: Record<string, string[]> | undefined): Record<string, string[]> | undefined {
  if (!warnings) return undefined

  return Object.entries(warnings).reduce<Record<string, string[]>>((acc, [address, codes]) => {
    acc[getAddressKey(address)] = codes

    return acc
  }, {})
}

/**
 * Remote data, so a severity the interface does not know becomes the one that neither blocks the
 * import nor poisons the comparator with `NaN`. Reading it as published would make the unknown
 * value `serious`, which demands an acknowledgement for a risk nothing can describe.
 */
function toSeverity(severity: TokenWarningSeverity): TokenWarningSeverity {
  return SEVERITY_RANK[severity] === undefined ? 'info' : severity
}

function toWarningsInfo(
  address: string | undefined,
  types: Record<string, WarningType> | undefined,
  timestamp: string | undefined,
  codesByAddressKey: Record<string, string[]> | undefined,
  isRwa: boolean,
  isListed: boolean,
  isLoading: boolean,
): TokenWarningsInfo {
  // Curation is the signal: a token on one of CoW's lists never shows a risk signal, whatever the
  // published data says. The file is generated from those same lists, so without this every listed
  // mint carries one — USDC is published with freeze and mint authority. Jupiter draws the same
  // line: its risk API flags USDC, its swap form does not.
  if (isListed) {
    return { warnings: NO_WARNINGS, seriousWarnings: NO_WARNINGS, updatedAt: timestamp, isLoading: false }
  }

  const warnings = toTokenWarnings(address ? codesByAddressKey?.[getAddressKey(address)] : undefined, types, isRwa)

  return {
    warnings,
    seriousWarnings: warnings.filter((warning) => warning.tier === 'serious'),
    updatedAt: timestamp,
    isLoading,
  }
}

function useTokenWarningsFile(enabled: boolean): TokenWarningsFileState {
  const { data, isLoading } = useSWR<TokenWarningsFile>(
    enabled ? SOLANA_TOKEN_WARNINGS_URL : null,
    fetchTokenWarnings,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      // A fetch that never recovers leaves a flagged token looking clean, and an empty panel is
      // indistinguishable from "no warnings" — so this retries and revalidates on reconnect rather
      // than giving up. Neither blocks the form, which resolves independently of this.
      revalidateOnReconnect: true,
      errorRetryCount: ERROR_RETRY_COUNT,
    },
  )

  const codesByAddressKey = useMemo(() => toCodesByAddressKey(data?.warnings), [data])

  return { types: data?.types, timestamp: data?.timestamp, codesByAddressKey, isLoading }
}
