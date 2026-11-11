import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { unstable_cache } from 'next/cache'

import { getTokenKey } from '../lib/tokenKey'
import { getCommodityTroyOuncesPerToken } from '../model/commodityUnits'
import { getDividendModel, hasUiMultiplier, isVaultToken, isWrappedXStock } from '../model/issuers'
import { getAssets } from '../model/registry'

import type { RwaAsset, RwaToken, RwaTradingPause } from '../model/types'

import {
  fetchOndoSharesMultipliers,
  fetchXStocksActivation,
  readUiMultipliers,
  readVaultAssetsPerShare,
  withRetryBackoff,
} from '@/shared/api/index.server'

export interface SharesPerTokenLoadResult {
  /** Keyed by `getTokenKey`, tokens without a known multiplier are missing */
  byKey: Record<string, number>
  /** A multiplier source failed */
  degraded: boolean
}

interface SourceResult {
  values: Record<string, number>
  degraded: boolean
}

/** xStocks recommends pausing trading of a token 15 minutes before and after its multiplier activates */
const XSTOCKS_PAUSE_MARGIN_MS = 15 * 60_000
const ONCHAIN_RATES_REVALIDATE_SECONDS = 300
/** Bump when the cached rates change shape: the data cache outlives deployments */
const VAULT_RATES_CACHE_KEY = ['vault-token-rates', 'v1']
const UI_MULTIPLIERS_CACHE_KEY = ['ui-multipliers', 'v1']

const EMPTY_SOURCE: SourceResult = { values: {}, degraded: false }

/**
 * Shares of the underlying one token stands for. Ondo publishes a shares multiplier; a rebasing token is one share,
 * because `balanceOf()` already applies the multiplier; a cash-payout token is one share, because dividends leave it;
 * a commodity token is the troy ounces it holds, because it has no dividends; a vault token (wrapped xStocks, ST0x) is what it redeems
 * for; a Robinhood token is its onchain `uiMultiplier()`
 */
export async function loadSharesPerToken(tokens: RwaToken[]): Promise<SharesPerTokenLoadResult> {
  const [ondo, vaults, uiMultipliers] = await Promise.all([
    tokens.some(isOndoToken) ? loadOndoMultipliers() : EMPTY_SOURCE,
    loadPerChain('vault token rates', getChainIds(tokens, isVaultToken), loadChainVaultRates),
    loadPerChain('UI multipliers', getChainIds(tokens, hasUiMultiplier), loadChainUiMultipliers),
  ])
  const onchain = { ...vaults.values, ...uiMultipliers.values }
  const byKey: Record<string, number> = {}

  for (const token of tokens) {
    const multiplier = getSharesMultiplier(token, ondo.values, onchain)

    if (multiplier !== undefined) byKey[getTokenKey(token)] = multiplier
  }

  return { byKey, degraded: ondo.degraded || vaults.degraded || uiMultipliers.degraded }
}

/** `null` when the asset has no rebasing xStocks token, no multiplier activation is known, or the pause is over */
export async function loadTradingPause(asset: RwaAsset): Promise<RwaTradingPause | null> {
  const token = asset.tokens.find((item) => item.issuer === 'xStocks' && !isWrappedXStock(item))

  if (!token) return null

  try {
    const activatesAt = await fetchXStocksActivation(toXStocksSymbol(token.symbol), token.chainId)

    if (activatesAt === null || Date.now() >= activatesAt + XSTOCKS_PAUSE_MARGIN_MS) return null

    return {
      issuer: token.issuer,
      start: new Date(activatesAt - XSTOCKS_PAUSE_MARGIN_MS).toISOString(),
      end: new Date(activatesAt + XSTOCKS_PAUSE_MARGIN_MS).toISOString(),
    }
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[rwa] Failed to load the ${asset.ticker} xStocks multiplier`, error)

    return null
  }
}

function getChainIds(tokens: RwaToken[], predicate: (token: RwaToken) => boolean): number[] {
  return [...new Set(tokens.filter(predicate).map((token) => token.chainId))]
}

function getSharesMultiplier(
  token: RwaToken,
  ondoMultipliers: Record<string, number>,
  onchainRates: Record<string, number>,
): number | undefined {
  if (isVaultToken(token) || hasUiMultiplier(token)) return onchainRates[getTokenKey(token)]
  if (isOndoToken(token)) return ondoMultipliers[token.symbol.toUpperCase()]

  const model = getDividendModel(token)

  return model === 'rebase' || model === 'cash-payout' ? 1 : getCommodityTroyOuncesPerToken(token)
}

function isOndoToken(token: RwaToken): boolean {
  return token.issuer === 'Ondo'
}

/** Keyed by upper-case symbol. Empty, not degraded, without `ONDO_API_KEY` */
async function loadOndoMultipliers(): Promise<SourceResult> {
  try {
    return { values: (await fetchOndoSharesMultipliers()) ?? {}, degraded: false }
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load Ondo shares multipliers', error)

    return { values: {}, degraded: true }
  }
}

/** Keyed by `getTokenKey` */
async function loadPerChain(
  label: string,
  chainIds: number[],
  loadChain: (chainId: number) => Promise<Record<string, number>>,
): Promise<SourceResult> {
  const results = await Promise.all(
    chainIds.map(async (chainId): Promise<SourceResult> => {
      try {
        return { values: await loadChain(chainId), degraded: false }
      } catch (err: unknown) {
        const error = normalizeError(err)
        console.error(`[rwa] Failed to load ${label} on chain ${chainId}`, error)

        return { values: {}, degraded: true }
      }
    }),
  )

  return {
    values: Object.assign({}, ...results.map(({ values }) => values)),
    degraded: results.some(({ degraded }) => degraded),
  }
}

// Every registry token of the chain at once, so all routes share one cache entry per chain
const loadChainVaultRates = unstable_cache(
  (chainId: number): Promise<Record<string, number>> =>
    withRetryBackoff(`vault token rates on chain ${chainId}`, async () => {
      const vaults = getChainRegistryTokens(chainId, isVaultToken)

      return toRatesByTokenKey(vaults, await readVaultAssetsPerShare(chainId, vaults))
    }),
  VAULT_RATES_CACHE_KEY,
  { revalidate: ONCHAIN_RATES_REVALIDATE_SECONDS },
)

const loadChainUiMultipliers = unstable_cache(
  (chainId: number): Promise<Record<string, number>> =>
    withRetryBackoff(`UI multipliers on chain ${chainId}`, async () => {
      const tokens = getChainRegistryTokens(chainId, hasUiMultiplier)

      return toRatesByTokenKey(tokens, await readUiMultipliers(chainId, tokens))
    }),
  UI_MULTIPLIERS_CACHE_KEY,
  { revalidate: ONCHAIN_RATES_REVALIDATE_SECONDS },
)

function getChainRegistryTokens(chainId: number, predicate: (token: RwaToken) => boolean): RwaToken[] {
  return getAssets()
    .flatMap((asset) => asset.tokens)
    .filter((token) => token.chainId === chainId && predicate(token))
}

/** `rates` are keyed by `getAddressKey` */
function toRatesByTokenKey(tokens: RwaToken[], rates: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    tokens.flatMap((token) => {
      const rate = rates[getAddressKey(token.address)]

      return rate !== undefined && rate > 0 ? [[getTokenKey(token), rate] as const] : []
    }),
  )
}

/** The registry has CoinGecko symbols (`NVDAX`), the xStocks API wants its own (`NVDAx`) */
function toXStocksSymbol(symbol: string): string {
  return symbol.replace(/x$/i, 'x')
}
