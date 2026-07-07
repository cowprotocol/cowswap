import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { logWallet } from '@cowprotocol/common-utils'
import { AccountType } from '@cowprotocol/types'

import ms from 'ms.macro'
import { numberToHex } from 'viem'
import { getCapabilities } from 'viem/actions'

import { wagmiConfig } from '../../wagmi/config'
import {
  isSafeAppAtom,
  isSafeViaWcAtom,
  accountTypeAtom,
  isSmartContractWalletAtom,
  isSafeWalletAtom,
} from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
  atomicBatch?: { supported: boolean }
}

/**
 * Safe WC returns EIP-5792 capabilities keyed by hex chain id (e.g. "0xaa36a7")
 * while walletInfoAtom.chainId is numeric (e.g. 11155111). Numeric lookup alone misses them.
 */
export function resolveCapabilitiesForChain(
  capabilities: Record<string, WalletCapabilities>,
  chainId: number,
  isSafeViaWc: boolean,
): WalletCapabilities | null {
  const direct = capabilities[chainId]
  if (direct) return direct

  const hexChainId = numberToHex(chainId)
  const hexMatch = capabilities[hexChainId]
  if (hexMatch) return hexMatch

  const decimalKey = String(chainId)
  const decimalMatch = capabilities[decimalKey]
  if (decimalMatch) return decimalMatch

  // Safe WC may omit the exact chain key — use first entry only for confirmed Safe-via-WC.
  if (isSafeViaWc && Object.keys(capabilities).length > 0) {
    return Object.values(capabilities)[0]
  }

  return null
}

const WALLET_CAPABILITIES_LOADING_TIMEOUT = ms`5s`

let timeoutLogged = false

/**
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or null when disconnected or on error.
 */

export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | null> => {
  const { account, chainId } = get(walletInfoAtom)
  const isSafeViaWc = get(isSafeViaWcAtom)

  if (!account || !chainId || isSafeViaWc === null) return null

  let capabilities: Record<string, WalletCapabilities> = {}

  try {
    const shouldSkipCapabilitiesCheck = !account || !chainId

    if (shouldSkipCapabilitiesCheck) {
      return null
    }

    const getCapabilitiesPromise = getCapabilities(wagmiConfig.getClient({ chainId }), {
      account: account as `0x${string}`,
      chainId,
    })

    capabilities = await Promise.race([
      getCapabilitiesPromise,
      new Promise<Record<string, WalletCapabilities>>((resolve) =>
        setTimeout(() => resolve({}), WALLET_CAPABILITIES_LOADING_TIMEOUT),
      ).then(() => {
        if (!timeoutLogged) {
          timeoutLogged = true
          logWallet.warn(`Wallet capabilities loading timed out after ${WALLET_CAPABILITIES_LOADING_TIMEOUT / 1000}s`)
        }
        return {}
      }),
    ])
  } catch (getCapabilitiesError) {
    console.error('Cannot fetch wallet capabilities', getCapabilitiesError)
  }

  return resolveCapabilitiesForChain(capabilities, chainId, isSafeViaWc)
})

// eslint-disable-next-line complexity
export const isAtomicBatchSupportedAsyncAtom = atom(async (get): Promise<boolean | null> => {
  const isSafeApp = get(isSafeAppAtom)

  if (isSafeApp === null) return null

  if (isSafeApp) return true

  const accountType = get(accountTypeAtom)
  const isSmartContractWallet = get(isSmartContractWalletAtom)
  const isSafeWallet = get(isSafeWalletAtom)
  const isSafeViaWc = get(isSafeViaWcAtom)

  if (accountType === null || isSmartContractWallet === null || isSafeViaWc === null) return null

  // Smart accounts (ERC-4337, Coinbase Smart Wallet, EIP-7702, etc.) that are not a Safe lack the
  // fallback handler mechanism TWAP requires, so we treat them as unsupported.
  // Note: useIsSmartContractWallet() only detects AccountType.SMART_CONTRACT, not EIP-7702 accounts
  // (which keep the same EOA address but have delegation bytecode). We check both explicitly.
  if ((isSmartContractWallet || accountType === AccountType.EIP7702EOA) && !isSafeWallet && !isSafeViaWc) return false

  const walletCapabilities = await get(walletCapabilitiesAtom)

  // If `walletCapabilitiesAtom` returns `null` it's because `shouldSkipCapabilitiesCheck === false`,
  // or because some kind of API empty response or error. So, if we cannot check, then we must be false,
  // not null (as some components/functions like `validateTradeForm` treat `null` as loading):
  if (!walletCapabilities) return false

  const status = walletCapabilities.atomic?.status || ''
  const supported = walletCapabilities?.atomicBatch?.supported

  // See https://www.eip5792.xyz/getting-started:
  // - supported: The wallet will execute all calls atomically and contiguously
  // - ready: The wallet is able to upgrade to supported pending user approval (e.g. via EIP-7702)
  return status === 'supported' || !!supported
  // return status === 'supported' || status === 'ready'
})

export const isAtomicBatchSupportedLoadableAtom = loadable(isAtomicBatchSupportedAsyncAtom)

export const isAtomicBatchSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isAtomicBatchSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false
  if (loadable.state === 'hasData' && loadable.data === null) return null

  return loadable.data ?? false
})
