import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { getCapabilities, type GetCapabilitiesReturnType } from 'wagmi/actions'

import { logWallet, normalizeError, TimeoutError, withTimeout } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

import { wagmiConfig } from '../../wagmi/config'
import { isSafeAppAtom, isSafeViaWcAtom } from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

export type WalletCapabilities = GetCapabilitiesReturnType[number]

export const REQUEST_TIMEOUT_MS = ms`30s`

/**
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or null when disconnected or on error.
 */

export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | null> => {
  const { account, chainId, connector } = get(walletInfoAtom)

  if (!account || !chainId || !connector) return null

  try {
    logWallet.debug('Fetching wallet capabilities', { account, chainId })

    const capabilities = await withTimeout(
      getCapabilities(wagmiConfig, {
        account: account as `0x${string}`,
        chainId,
        connector,
      }),
      {
        timeout: REQUEST_TIMEOUT_MS,
        timeoutMessage: `Wallet capabilities loading timed out after ${REQUEST_TIMEOUT_MS / 1000}s`,
      },
    )

    logWallet.debug('Fetched wallet capabilities', { account, chainId, capabilities })
    return capabilities
  } catch (err: unknown) {
    const error = normalizeError(err)

    if (error instanceof TimeoutError) {
      logWallet.warn(error.message)
    } else {
      logWallet.error(new Error('Failed to fetch wallet capabilities', { cause: error }), undefined, {
        account,
        chainId,
      })
    }

    return null
  }
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
