import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { isMobile, PromiseWithTimeout } from '@cowprotocol/common-utils'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { AccountType } from '@cowprotocol/types'

import { EIP1193Provider, numberToHex, PublicClient } from 'viem'
import { getCapabilities } from 'viem/actions'
import { Connector } from 'wagmi'

import { config } from '../../wagmi/config'
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

const REQUEST_TIMEOUT_MS = 10_000

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
  atomicBatch?: { supported: boolean }
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
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or null when disconnected or on error.
 */
// eslint-disable-next-line complexity
export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | null> => {
  const { account, chainId, connector, provider } = get(walletInfoAtom)
  const isSafeViaWc = get(isSafeViaWcAtom)

  if (!account || !chainId || !connector || !provider || isSafeViaWc === null) return null

  let capabilities: Record<string, WalletCapabilities> = {}

  try {
    const shouldSkipCapabilitiesCheck = await getShouldSkipCapabilitiesCheck(connector, provider)

    if (shouldSkipCapabilitiesCheck) {
      return null
    }

    capabilities = await getCapabilities(config.getClient({ chainId }), {
      account: account as `0x${string}`,
      chainId,
    })
  } catch (getCapabilitiesError) {
    if (!isEip1193Provider(provider)) {
      console.error('Cannot fetch wallet capabilities', getCapabilitiesError)
      throw getCapabilitiesError
    }

    try {
      const legacyCapabilities = await provider.request({
        method: 'wallet_getCapabilities',
        params: [account],
      })

      capabilities = legacyCapabilities || {}

      console.warn('getCapabilities() failed, but wallet_getCapabilities returned capabilities', legacyCapabilities)
    } catch (walletGetCapabilitiesError) {
      console.error(
        'Both getCapabilities() and wallet_getCapabilities failed',
        getCapabilitiesError,
        walletGetCapabilitiesError,
      )
    }
  }

  return resolveCapabilitiesForChain(capabilities, chainId, isSafeViaWc)
})

// eslint-disable-next-line complexity
export const isBundlingSupportedAsyncAtom = atom(async (get): Promise<boolean | null> => {
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

export const isBundlingSupportedLoadableAtom = loadable(isBundlingSupportedAsyncAtom)

export const isBundlingSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isBundlingSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false
  if (loadable.state === 'hasData' && loadable.data === null) return null

  return loadable.data ?? false
})
