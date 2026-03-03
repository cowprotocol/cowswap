import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { getRpcProvider } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { isSafeAppAtom, isSafeViaWcAtom } from 'src/web3-react/hooks/useWalletMetadata'
import { getCapabilities } from 'wagmi/actions'

import { config } from '../../wagmi/config'
import { getIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { walletInfoAtom } from '../state'

function fetchWidgetProviderMetaInfo(chainId: SupportedChainId): Promise<ProviderMetaInfoPayload | null> {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = getRpcProvider(chainId)

  if (provider instanceof WidgetEthereumProvider) {
    return new Promise((resolve) => {
      provider.onProviderMetaInfo(resolve)
    })
  }

  return Promise.resolve(null)
}

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual requests.
 */
export async function getShouldCheckCapabilities(
  isWalletConnect: boolean,
  chainId: SupportedChainId,
): Promise<boolean> {
  // When widget in the mobile device, wait till providerWcMetadata is loaded
  // In order to detect if is connected to WalletConnect
  if ((isInjectedWidget() && isMobile) || isWalletConnect) {
    return false
  }

  if (!isMobile) {
    return Promise.resolve(true)
  }

  const widgetProviderMetaInfo = await fetchWidgetProviderMetaInfo(chainId)
  const isWalletConnectViaWidget = !!widgetProviderMetaInfo?.providerWcMetadata

  return !isWalletConnectViaWidget
}

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

/**
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or undefined when disconnected or on error.
 */
export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | undefined> => {
  const { account, chainId, connector } = get(walletInfoAtom)

  // TODO this will be fixed in M-3 COW-569
  const provider = getRpcProvider(chainId)

  if (!account || !chainId || !provider) return undefined

  const isWalletConnect = getIsWalletConnect(connector)
  const shouldCheckCapabilities = await getShouldCheckCapabilities(isWalletConnect, chainId)

  if (!shouldCheckCapabilities) {
    return undefined
  }

  try {
    const result = await getCapabilities(config, {
      account: account as `0x${string}`,
      chainId,
    })

    if (!result) return undefined

    const chainIdHex = `0x${chainId.toString(16)}`
    const byChain = result as Record<string, WalletCapabilities> | WalletCapabilities

    if (typeof (byChain as Record<string, WalletCapabilities>)[chainIdHex] !== 'undefined') {
      return (byChain as Record<string, WalletCapabilities>)[chainIdHex]
    }

    if (typeof (byChain as Record<string, WalletCapabilities>).atomic !== 'undefined') {
      return byChain as WalletCapabilities
    }

    const firstKey = Object.keys(byChain as Record<string, WalletCapabilities>)[0]

    return firstKey ? (byChain as Record<string, WalletCapabilities>)[firstKey] : undefined
  } catch (error) {
    console.error('walletCapabilitiesAtom error', error)
    return undefined
  }
})

/** Sync atom that exposes { state, data, error } for walletCapabilitiesAtom. Use in hooks for loading/data. */
export const walletCapabilitiesLoadableAtom = loadable(walletCapabilitiesAtom)

export const isBundlingSupportedAtom = atom(async (get): Promise<boolean | null> => {
  // TODO this will be fixed in M-3 COW-569
  if (get(isSafeAppAtom)) return true

  const walletCapabilities = await get(walletCapabilitiesAtom)

  if (!walletCapabilities) return null

  return !!get(isSafeViaWcAtom) && walletCapabilities.atomic?.status === 'supported'
})

export const isBundlingSupportedLoadableAtom = loadable(isBundlingSupportedAtom)
