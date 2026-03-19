import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { getRpcProvider, LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { isMobile, PromiseWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ProviderMetaInfoPayload, WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { getCapabilities } from 'viem/actions'

import { config } from '../../wagmi/config'
import { getIsWalletConnect } from '../../wagmi/hooks/useIsWalletConnect'
import { getIsWalletConnect as getIsWalletConnectLegacy } from '../../web3-react/hooks/useIsWalletConnect'
import { isSafeAppAtom, isSafeViaWcAtom } from '../../web3-react/hooks/useWalletMetadata'
import { walletInfoAtom } from '../state'

const REQUEST_TIMEOUT_MS = 10_000

export interface WalletCapabilities {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

/**
 * Walletconnect in mobile browsers initiates a request with confirmation to the wallet
 * to get the capabilities. It breaks the flow with perpetual requests.
 */
export async function getShouldCheckCapabilities(
  isWalletConnect: boolean,
  chainId: SupportedChainId,
): Promise<boolean> {
  const widgetProviderMetaInfo = await fetchWidgetProviderMetaInfo(chainId)
  const isWalletConnectViaWidget = !!widgetProviderMetaInfo?.providerWcMetadata

  return !((isWalletConnect || isWalletConnectViaWidget) && isMobile)
}

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
 * Async atom that fetches wallet capabilities (EIP-5792) via wagmi/viem.
 * Returns capabilities for the current account and chain, or undefined when disconnected or on error.
 */

export const walletCapabilitiesAtom = atom(async (get): Promise<WalletCapabilities | undefined> => {
  const { account, chainId, legacyConnector, connector, provider } = get(walletInfoAtom)

  if (!account || !chainId || !provider || !legacyConnector || !connector) return undefined

  const isWalletConnectLegacy = getIsWalletConnectLegacy(legacyConnector)
  const isWalletConnectNew = getIsWalletConnect(connector)

  const isWalletConnect = LAUNCH_DARKLY_VIEM_MIGRATION ? isWalletConnectNew : isWalletConnectLegacy

  const shouldCheckCapabilities = await getShouldCheckCapabilities(isWalletConnect, chainId)

  if (!shouldCheckCapabilities) {
    return undefined
  }

  try {
    // TODO this will be fixed in M-3 COW-569

    if (LAUNCH_DARKLY_VIEM_MIGRATION) {
      return getCapabilities(config.getClient({ chainId }), {
        account: account as `0x${string}`,
        chainId,
      })
    }

    const result = await new PromiseWithTimeout<WalletCapabilities | undefined>(
      REQUEST_TIMEOUT_MS,
      (resolve, reject) => {
        provider
          .send('wallet_getCapabilities', [account])
          .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
            if (!result) {
              resolve(undefined)
              return
            }

            const chainIdHex = `0x${chainId.toString(16)}`

            // fallback for Safe wallets https://github.com/safe-global/safe-wallet-monorepo/issues/6906
            resolve(result[chainIdHex] || result[Object.keys(result)[0]])
          })
          .catch((error) => {
            console.error('getCapabilities promise error:', error)
            reject(error)
          })
      },
    )

    return result
  } catch (error) {
    console.error('Failed to fetch wallet capabilities:', error)
    return undefined
  }
})

/** Sync atom that exposes { state, data, error } for walletCapabilitiesAtom. Use in hooks for loading/data. */
export const walletCapabilitiesLoadableAtom = loadable(walletCapabilitiesAtom)

export const isBundlingSupportedAsyncAtom = atom(async (get): Promise<boolean> => {
  if (get(isSafeAppAtom)) return true

  const walletCapabilities = await get(walletCapabilitiesAtom)

  // If `walletCapabilitiesAtom` returns `undefined` it's because `shouldCheckCapabilities === false`,
  // or because some kind of API empty response or error. So, if we cannot check, then we must be false,
  // not null (as some components/functions like `validateTradeForm` treat `null` as loading):
  if (!walletCapabilities) return false

  const status = walletCapabilities.atomic?.status || ''

  // See https://www.eip5792.xyz/getting-started:
  // - supported: The wallet will execute all calls atomically and contiguously
  // - ready: The wallet is able to upgrade to supported pending user approval (e.g. via EIP-7702)
  return !!get(isSafeViaWcAtom) && ['supported', 'ready'].includes(status)
})

export const isBundlingSupportedLoadableAtom = loadable(isBundlingSupportedAsyncAtom)

export const isBundlingSupportedAtom = atom((get): boolean | null => {
  const loadable = get(isBundlingSupportedLoadableAtom)

  if (loadable.state === 'loading') return null
  if (loadable.state === 'hasError') return false

  return loadable.data ?? false
})
