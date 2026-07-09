import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { isMobile, logWallet, PromiseWithTimeout } from '@cowprotocol/common-utils'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { AccountType } from '@cowprotocol/types'

import ms from 'ms.macro'
import { EIP1193Provider, numberToHex, PublicClient } from 'viem'
import { getCapabilities, type GetCapabilitiesReturnType } from 'viem/actions'
import { Connector } from 'wagmi'

import { wagmiConfig } from '../../wagmi/config'
import { getIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import {
  isSafeAppAtom,
  isSafeViaWcAtom,
  accountTypeAtom,
  isSmartContractWalletAtom,
  isSafeWalletAtom,
} from '../../wagmi/state/walletMetadata.atoms'
import { isEip1193Provider } from '../../wagmi/utils/isEip1193Provider.utils'
import { walletInfoAtom } from '../state'

export type WalletCapabilities = GetCapabilitiesReturnType[number]

const WALLET_CAPABILITIES_LOADING_TIMEOUT = ms`5s`

let timeoutLogged = false

function getTimeoutPromise<T = WalletCapabilities | GetCapabilitiesReturnType>(): Promise<T> {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), WALLET_CAPABILITIES_LOADING_TIMEOUT)).then(() => {
    if (!timeoutLogged) {
      timeoutLogged = true
      logWallet.warn(`Wallet capabilities loading timed out after ${WALLET_CAPABILITIES_LOADING_TIMEOUT / 1000}s`)
    }
    return {} as T
  })
}

/**
 * WalletConnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual requests.
 */
export async function getShouldSkipCapabilitiesCheck(
  connector: Connector,
  provider: EIP1193Provider | WidgetEthereumProvider | PublicClient,
): Promise<boolean> {
  if (!isMobile) return false

  const isWalletConnect = getIsWalletConnect(connector)

  if (isWalletConnect) return true

  const widgetProviderMetaInfo = await fetchWidgetProviderMetaInfo(provider)
  const isWalletConnectViaWidget = !!widgetProviderMetaInfo?.providerWcMetadata

  return isWalletConnectViaWidget
}

const REQUEST_TIMEOUT_MS = ms`5s`

async function fetchWidgetProviderMetaInfo(
  provider: EIP1193Provider | WidgetEthereumProvider | PublicClient,
): Promise<ProviderMetaInfoPayload | null> {
  if (provider instanceof WidgetEthereumProvider) {
    return PromiseWithTimeout<ProviderMetaInfoPayload>(REQUEST_TIMEOUT_MS, (resolve) => {
      provider.onProviderMetaInfo((data) => {
        provider.clearProviderMetaInfoListener()
        resolve(data)
      })
    }).catch(() => {
      provider.clearProviderMetaInfoListener()
      return null
    })
  }

  return Promise.resolve(null)
}

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

  // This fallback was initially here for Safe via WC, even thought it should return a value as shown in the example in
  // the long TSDoc comment below. `Object.values` should not be needed, as we are already parsing this properly with
  // `numberToHex` above:

  return Object.values(capabilities)[0] || null
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
    const shouldSkipCapabilitiesCheck = await getShouldSkipCapabilitiesCheck(connector, provider)

    if (shouldSkipCapabilitiesCheck) {
      return null
    }

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

    const getCapabilitiesPromise = getCapabilities(wagmiConfig.getClient({ chainId }), {
      account: account as `0x${string}`,
      chainId,
    })

    capabilities = await Promise.race([getCapabilitiesPromise, getTimeoutPromise<WalletCapabilities>()])
  } catch (getCapabilitiesError) {
    if (!isEip1193Provider(provider)) {
      console.error('Cannot fetch wallet capabilities', getCapabilitiesError)
      throw getCapabilitiesError
    }

    try {
      const legacyCapabilitiesPromise = provider.request({
        method: 'wallet_getCapabilities',
        params: [account],
      })

      const legacyCapabilities = await Promise.race([
        legacyCapabilitiesPromise,
        getTimeoutPromise<GetCapabilitiesReturnType>(),
      ])

      capabilities = resolveCapabilitiesForChain(legacyCapabilities, chainId)

      console.warn('getCapabilities() failed, but wallet_getCapabilities returned capabilities', legacyCapabilities)
    } catch (walletGetCapabilitiesError) {
      console.error(
        'Both getCapabilities() and wallet_getCapabilities failed',
        getCapabilitiesError,
        walletGetCapabilitiesError,
      )
    }
  }

  return capabilities
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

  // If `walletCapabilitiesAtom` returns `null` it's because `shouldSkipCapabilitiesCheck === true`,
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
