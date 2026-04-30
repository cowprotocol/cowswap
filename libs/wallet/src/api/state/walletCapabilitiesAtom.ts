import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { isMobile, PromiseWithTimeout } from '@cowprotocol/common-utils'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { EIP1193Provider, PublicClient } from 'viem'
import { getCapabilities } from 'viem/actions'
import { Connector } from 'wagmi'

import { config } from '../../wagmi/config'
import { getIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { isSafeAppAtom, isSafeViaWcAtom } from '../../wagmi/state/walletMetadata.atoms'
import { isEip1193Provider } from '../../wagmi/utils/isEip1193Provider.utils'
import { walletInfoAtom } from '../state'

const REQUEST_TIMEOUT_MS = 10_000

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
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
 * Returns capabilities for the current account and chain, or undefined when disconnected or on error.
 */
// eslint-disable-next-line complexity
export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | undefined> => {
  const { account, chainId, connector, provider } = get(walletInfoAtom)

  if (!account || !chainId || !connector || !provider) return undefined

  let capabilities: Record<string, WalletCapabilities> = {}

  try {
    const shouldSkipCapabilitiesCheck = await getShouldSkipCapabilitiesCheck(connector, provider)

    if (shouldSkipCapabilitiesCheck) {
      return undefined
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

  return (capabilities[chainId] || Object.values(capabilities)[0]) as WalletCapabilities | undefined
})

/** Sync atom that exposes { state, data, error } for walletCapabilitiesAtom. Use in hooks for loading/data. */
export const walletCapabilitiesLoadableAtom = loadable(walletCapabilitiesAtom)

export const isBundlingSupportedAsyncAtom = atom(async (get): Promise<boolean> => {
  if (get(isSafeAppAtom) || get(isSafeViaWcAtom)) return true

  const walletCapabilities = await get(walletCapabilitiesAtom)

  // If `walletCapabilitiesAtom` returns `undefined` it's because `shouldCheckCapabilities === false`,
  // or because some kind of API empty response or error. So, if we cannot check, then we must be false,
  // not null (as some components/functions like `validateTradeForm` treat `null` as loading):
  if (!walletCapabilities) return false

  const status = walletCapabilities.atomic?.status || ''

  // See https://www.eip5792.xyz/getting-started:
  // - supported: The wallet will execute all calls atomically and contiguously
  // - ready: The wallet is able to upgrade to supported pending user approval (e.g. via EIP-7702)
  return status === 'supported'
  // return status === 'supported' || status === 'ready'
})

export const isBundlingSupportedLoadableAtom = loadable(isBundlingSupportedAsyncAtom)

export const isBundlingSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isBundlingSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false

  return loadable.data ?? false
})
