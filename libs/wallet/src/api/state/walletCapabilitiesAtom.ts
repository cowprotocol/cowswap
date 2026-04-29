import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { isMobile, PromiseWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { getCapabilities } from 'viem/actions'
import { Connector } from 'wagmi'

import { config } from '../../wagmi/config'
import { getIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { isSafeAppAtom, isSafeViaWcAtom } from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

const REQUEST_TIMEOUT_MS = 10_000

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual requests.
 */
export async function getShouldCheckCapabilities(connector: Connector, chainId: SupportedChainId): Promise<boolean> {
  const isWalletConnect = getIsWalletConnect(connector)
  const widgetProviderMetaInfo = await fetchWidgetProviderMetaInfo(connector, chainId)
  const isWalletConnectViaWidget = !!widgetProviderMetaInfo?.providerWcMetadata

  return !((isWalletConnect || isWalletConnectViaWidget) && isMobile)
}

async function fetchWidgetProviderMetaInfo(
  connector: Connector,
  chainId: SupportedChainId,
): Promise<ProviderMetaInfoPayload | null> {
  const provider = await connector.getProvider({ chainId })

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
 * Returns capabilities for the current account and chain, or undefined when disconnected or on error.
 */
export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | undefined> => {
  const { account, chainId, connector } = get(walletInfoAtom)

  if (!account || !chainId || !connector) return undefined

  try {
    const shouldCheckCapabilities = await getShouldCheckCapabilities(connector, chainId)

    if (!shouldCheckCapabilities) {
      return undefined
    }

    const capabilities = await getCapabilities(config.getClient({ chainId }), {
      account: account as `0x${string}`,
      chainId,
    })

    return (capabilities[chainId] || Object.values(capabilities)[0]) as WalletCapabilities | undefined
  } catch (error) {
    console.error('Failed to fetch wallet capabilities:', error)
    return undefined
  }
})

/** Sync atom that exposes { state, data, error } for walletCapabilitiesAtom. Use in hooks for loading/data. */
export const walletCapabilitiesLoadableAtom = loadable(walletCapabilitiesAtom)

export const isBundlingSupportedAsyncAtom = atom(async (get): Promise<boolean> => {
  // TODO: Before Viem PR this was like this:
  // if (get(isSafeAppAtom)) return true

  if (get(isSafeAppAtom) || get(isSafeViaWcAtom)) return true

  const walletCapabilities = await get(walletCapabilitiesAtom)

  // If `walletCapabilitiesAtom` returns `undefined` it's because `shouldCheckCapabilities === false`,
  // or because some kind of API empty response or error. So, if we cannot check, then we must be false,
  // not null (as some components/functions like `validateTradeForm` treat `null` as loading):
  if (!walletCapabilities) return false

  const status = walletCapabilities.atomic?.status || ''

  return status === 'supported'

  // TODO: Before Viem PR this was like this:
  // See https://www.eip5792.xyz/getting-started:
  // - supported: The wallet will execute all calls atomically and contiguously
  // - ready: The wallet is able to upgrade to supported pending user approval (e.g. via EIP-7702)
  // return !!get(isSafeViaWcAtom) && ['supported', 'ready'].includes(status)
})

export const isBundlingSupportedLoadableAtom = loadable(isBundlingSupportedAsyncAtom)

export const isBundlingSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isBundlingSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false

  return loadable.data ?? false
})
