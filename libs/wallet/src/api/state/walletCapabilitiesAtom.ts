import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { numberToHex } from 'viem'

import { isEip1193Provider, logWallet, normalizeError, TimeoutError, withTimeout } from '@cowprotocol/common-utils'

import ms from 'ms.macro'
import { getCapabilities, type GetCapabilitiesReturnType } from 'viem/actions'

import { wagmiConfig } from '../../wagmi/config'
import { isSafeAppAtom, isSafeViaWcAtom } from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

export type WalletCapabilities = GetCapabilitiesReturnType[number]

export const REQUEST_TIMEOUT_MS = ms`30s`

/**
 * Safe WC returns EIP-5792 capabilities keyed by hex chain id (e.g. "0xaa36a7")
 * while walletInfoAtom.chainId is numeric (e.g. 11155111). Numeric lookup alone misses them.
 */
export function resolveCapabilitiesForChain(
  capabilities: Record<string, WalletCapabilities>,
  chainId: number,
): WalletCapabilities | null {
  const capabilitiesForChain = capabilities[chainId] ?? capabilities[numberToHex(chainId)]

  if (capabilitiesForChain) return capabilitiesForChain

  logWallet.warn('Cannot resolve wallet capabilities for chain', { chainId, capabilities })
  return null
}

/**
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or null when disconnected or on error.
 */

export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | null> => {
  const { account, chainId, provider, connector } = get(walletInfoAtom)
  const isSafeViaWc = get(isSafeViaWcAtom)

  if (!account || !chainId || !connector || !provider || isSafeViaWc === null) return null

  let capabilities: WalletCapabilities | null = null

  try {
    /**
     * Viem takes care here of getting the capabilities for the exact chainId, so we don't need to do it manually.
     * However, keep in mind this branch MUST run for Safe via WC, but getCapabilities() will throw an error. However,
     * using `wallet_getCapabilities` directly does work. You can test this with:
     *
     * ```
     * const allCapabilities = await getCapabilities(wagmiConfig.getClient({ chainId }), {
     *   account: account as `0x${string}`,
     * }).catch((error) => {
     *   console.error('Cannot fetchallCapabilities', error)
     *   return {} as GetCapabilitiesReturnType
     * })
     *
     * const capabilitiesForChain = await getCapabilities(wagmiConfig.getClient({ chainId }), {
     *   account: account as `0x${string}`,
     *   chainId,
     * }).catch((error) => {
     *   console.error('Cannot fetch capabilitiesForChain', error)
     *   return {} as GetCapabilitiesReturnType
     * })
     *
     * const legacyCapabilities = isEip1193Provider(provider)
     *   ? await provider
     *     .request({
     *     method: 'wallet_getCapabilities',
     *     params: [account],
     *   })
     *   .catch((error) => {
     *     console.error('Cannot fetch legacyCapabilities', error)
     *     return {} as GetCapabilitiesReturnType
     *   })
     * : null
     * ```
     *
     * The last one should return:
     *
     * ```json
     * {
     *   "0xaa36a7": {
     *     "atomicBatch": {
     *       "supported": true
     *     },
     *     "atomic": {
     *       "status": "supported"
     *     }
     *   }
     * }
     * ```
     */

    logWallet.debug('Fetching wallet capabilities', { account, chainId })

    // TODO remove this completely: it doesn't resolve capabilities for no wallet: MM, Safe, Ambire.
    capabilities = await withTimeout(
      getCapabilities(wagmiConfig.getClient({ chainId }), {
        account: account as `0x${string}`,
        chainId,
      }),
      {
        timeout: REQUEST_TIMEOUT_MS,
        timeoutMessage: `Wallet capabilities loading timed out after ${REQUEST_TIMEOUT_MS / 1000}s`,
      },
    )

    logWallet.debug('Fetched wallet capabilities', { account, chainId, capabilities })
  } catch (err: unknown) {
    const wagmiError = normalizeError(err)

    if (!isEip1193Provider(provider)) {
      logWallet.error(new Error('Failed to fetch wallet capabilities via wagmi', { cause: wagmiError }), undefined, {
        account,
        chainId,
      })
      return null
    }

    try {
      const legacyCapabilities = await withTimeout(
        provider.request({
          method: 'wallet_getCapabilities',
          params: [account],
        }),
        {
          timeout: REQUEST_TIMEOUT_MS,
          timeoutMessage: `Wallet capabilities loading timed out after ${REQUEST_TIMEOUT_MS / 1000}s`,
        },
      )
      logWallet.warn('getCapabilities() failed, but wallet_getCapabilities returned capabilities', legacyCapabilities)

      capabilities = resolveCapabilitiesForChain(legacyCapabilities, chainId)

      logWallet.info('Wallet capabilities for this chain:', capabilities)
    } catch (err: unknown) {
      const rpcError = normalizeError(err)

      if (rpcError instanceof TimeoutError) {
        logWallet.warn(rpcError.message)
      } else {
        logWallet.error(new Error('Failed to fetch wallet capabilities via RPC', { cause: rpcError }), undefined, {
          account,
          chainId,
        })
      }

      return null
    }
  }

  return capabilities
})

export const isAtomicBatchSupportedAsyncAtom = atom(async (get): Promise<boolean | null> => {
  const isSafeApp = get(isSafeAppAtom)
  const isSafeViaWc = get(isSafeViaWcAtom)

  /**
   * A SafeWallet connected through SafeApp is assumed to have support.
   * A SafeWallet connected through WC or any other provider needs to pass the capabilities check.
   */
  if (isSafeApp) return true
  if (isSafeApp === null || isSafeViaWc === null) return null

  const walletCapabilities = await get(walletCapabilitiesAtom)

  // If `walletCapabilitiesAtom` returns `null` it's because some kind of API empty response
  // or error. So, if we cannot check, then we must be false,
  // not null (as some components/functions like `validateTradeForm` treat `null` as loading):
  if (walletCapabilities === null) return false

  const status = walletCapabilities.atomic?.status
  const isLegacyAtomicBatchSupported = Boolean(walletCapabilities?.atomicBatch?.supported)

  // See https://www.eip5792.xyz/getting-started:
  // - supported: The wallet will execute all calls atomically and contiguously
  // - ready: The wallet is able to upgrade to supported pending user approval (e.g. via EIP-7702)
  return status === 'supported' || status === 'ready' || isLegacyAtomicBatchSupported
})

export const isAtomicBatchSupportedLoadableAtom = loadable(isAtomicBatchSupportedAsyncAtom)

export const isAtomicBatchSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isAtomicBatchSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false
  if (loadable.state === 'hasData' && loadable.data === null) return null

  return loadable.data ?? false
})
