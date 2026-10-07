import { atom } from 'jotai'
import { atomWithRefresh, loadable } from 'jotai/utils'

import {
  getPublicClient,
  logWallet,
  normalizeError,
  retry,
  RetryableError,
  RetryOptions,
} from '@cowprotocol/common-utils'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'

import { gnosisSafeInfoAtom, isKnownNotSafeAtom, walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'
import { RABBY_RDNS } from '../../constants'
import { isEip7702EOA } from '../utils/isEip7702EOA.utils'
import { isSafeConnector } from '../utils/isSafeConnector.utils'

const ACCOUNT_TYPE_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 250, maxWait: 1000 }

export const isSafeWalletAtom = atom((get): boolean => {
  return !!get(gnosisSafeInfoAtom)
})

export const isSafeAppAtom = atom((get): boolean | null => {
  const { connector } = get(walletInfoAtom)

  if (!connector) return null

  return isSafeConnector(connector)
})

const safeAppsSdk = new SafeAppsSDK()

export const safeAppsSdkAtom = atom((get): SafeAppsSDK | null => {
  return get(isSafeAppAtom) === true ? safeAppsSdk : null
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)

  // Still loading:
  if (isSafeApp === null) return null

  // isSafeAppAtom is boolean | null — null means connector not ready yet, not a Safe App.
  if (isSafeApp) return false

  const { connector } = get(walletInfoAtom)

  // TODO: connector will be undefined on page load until the WalletUpdater kicks in. Consider replacing the updater with atom's onMount/observer.
  if (!connector) return null

  // TODO: Separate Safe identity from connection type. Imported Safes in injected wallets
  // are intentionally treated as Safe-via-WC until isSafeWalletAtom exposes its loading state.
  if (get(isSafeWalletAtom)) return true

  if (isSafeApp || connector.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})

/**
 * True when the connected wallet cannot change networks.
 * Safe Apps and WalletConnect sessions whose peer name includes "safe" cannot switch.
 * Rabby, injected imported Safes (for example Ambire), and other wallets can.
 */
export const isNetworkSwitchUnsupportedAtom = atom((get): boolean => {
  const { connector } = get(walletInfoAtom)

  if (connector?.id === RABBY_RDNS) return false
  if (get(isSafeAppAtom) === true) return true
  if (connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const peerName = get(walletDetailsAtom).wcPeerName?.toLowerCase() || ''

  return peerName.includes('safe')
})

/**
 * True when the wallet is not a Safe (including Safe via WalletConnect).
 * Returns null while the connector, account type, or Safe lookup is unresolved.
 */
export const isEoaAtom = atom((get): boolean | null => {
  const isSafeViaWc = get(isSafeViaWcAtom)

  if (isSafeViaWc === null) return null
  if (get(isSafeWalletAtom) || isSafeViaWc) return false

  const accountType = get(accountTypeAtom)
  if (accountType === null) return null

  if (accountType === AccountType.SMART_CONTRACT && !get(isKnownNotSafeAtom)) return null

  return true
})

/** Async account-type lookup. Call `set(accountTypeAsyncAtom)` to retry after retries are exhausted. */
export const accountTypeAsyncAtom = atomWithRefresh(async (get) => {
  const { chainId, account, connector } = get(walletInfoAtom)

  if (!chainId || !account || !connector) return null
  if (!isEvmChain(chainId)) return null

  const publicClient = getPublicClient(chainId)

  try {
    return await retry(async () => {
      try {
        const code = await publicClient.getCode({ address: account })

        if (!code || code === '0x') {
          return AccountType.EOA
        }

        if (isEip7702EOA(code, account)) {
          return AccountType.EIP7702EOA
        }

        return AccountType.SMART_CONTRACT
      } catch (err: unknown) {
        const error = normalizeError(err)
        logWallet.warn(`checkIsSmartContractWallet: failed to check address ${account}`, error.message)
        throw new RetryableError(error.message)
      }
    }, ACCOUNT_TYPE_RETRY_OPTIONS).promise
  } catch (err: unknown) {
    throw normalizeError(err)
  }
})

export const accountTypeLoadableAtom = loadable(accountTypeAsyncAtom)

export const accountTypeAtom = atom((get): AccountType | null => {
  const loadable = get(accountTypeLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return null

  return loadable.data ?? null
})

/**
 * True for Safe wallets and bytecode contracts.
 * Returns false while the code lookup is in flight, so that "unknown" is not
 * treated as a smart-contract wallet. Returns null if that lookup fails. Consumers
 * must not assume EOA until a retry succeeds.
 */
export const isSmartContractWalletAtom = atom((get): boolean | null => {
  if (get(isSafeWalletAtom)) return true

  const loadable = get(accountTypeLoadableAtom)

  if (loadable.state === 'loading') return false
  if (loadable.state === 'hasError') return null

  const accountType = loadable.data

  if (accountType == null) return null

  return accountType === AccountType.SMART_CONTRACT
})
