import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider, http } from 'viem'
import { createStorage, type Transport } from 'wagmi'

import { COW_WIDGET_CONNECTOR_ID, SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

type ConnectorInstance = ReturnType<typeof safe> | ReturnType<typeof injected>

function isEmbeddedInIframe(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}

const connectorParams = { shimDisconnect: true }

function getConnectors(): ConnectorInstance[] {
  if (isEmbeddedInIframe()) {
    if (isInjectedWidget()) {
      return [
        injected({
          ...connectorParams,
          target: {
            name: 'CoW Widget',
            id: COW_WIDGET_CONNECTOR_ID,
            provider: new WidgetEthereumProvider() as EIP1193Provider,
          },
        }),
        injected(connectorParams),
        // Include Safe connector so the widget can auto-connect when hosted inside a Safe app
        // (e.g. widget-configurator loaded as a Safe App). IframeSafeSdkBridge in widget-lib
        // already forwards the Safe SDK postMessages through the configurator to app.safe.global.
        safe(connectorParams),
      ]
    }

    return [safe(connectorParams), injected(connectorParams)]
  }

  return [injected(connectorParams)]
}

const wagmiTransports = SUPPORTED_REOWN_NETWORKS.reduce(
  (acc, chain) => {
    const chainId = chain.id as SupportedChainId
    const url = RPC_URLS[chainId]
    if (url) {
      acc[chainId] = http(url)
    }
    return acc
  },
  {} as Record<SupportedChainId, Transport>,
)

/** CAIP-shaped RPCs for AppKit UI / network metadata (pairs with `wagmiTransports`). */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const url = RPC_URLS[chain.id as SupportedChainId]
  if (url) {
    customRpcUrls[`eip155:${chain.id}`] = [{ url }]
  }
}

const projectId = 'ac287751638b5d374a03c39e37f70376'

const WAGMI_STORAGE_KEY = 'cowswap-wallet' + (isInjectedWidget() ? COW_WIDGET_CONNECTOR_ID : '')

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        storage: window.localStorage,
        key: WAGMI_STORAGE_KEY,
      })

const metadata = {
  name: 'CoW Swap | The smartest way to trade cryptocurrencies',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/apple-touch-icon.png'],
}

export const connectors = getConnectors() as ConstructorParameters<typeof WagmiAdapter>[0]['connectors']

const RECENT_CONNECTOR_KEY = 'recentConnectorId'
/**
 * Recent connector takes priority, and we have to override it in the widget
 */
if (isInjectedWidget()) {
  storage.setItem(RECENT_CONNECTOR_KEY, COW_WIDGET_CONNECTOR_ID)
}

export const wagmiAdapter = new WagmiAdapter({
  connectors,
  customRpcUrls,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  storage,
  transports: wagmiTransports,
})

export const config = wagmiAdapter.wagmiConfig

export const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: VIEM_CHAINS[getCurrentChainIdFromUrl()],
  // Disable EIP-6963 inside imToken's browser: AppKit's EIP-6963 path calls eth_requestAccounts
  // through too many async layers, losing the iOS WebKit gesture context — the call hangs forever.
  // imToken is instead featured as a WalletConnect option (featuredWalletIds) so it appears on
  // the first modal screen, and the WalletConnect path works correctly inside imToken's browser.
  enableEIP6963: !isImTokenBrowser,
  enableReconnect: true,
  enableWalletGuide: false,
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    // imToken — shown prominently so users inside imToken's browser can find the WalletConnect path
    'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef',
  ],
  features: {
    analytics: false,
    email: false,
    socials: false,
    connectorTypeOrder: ['injected', 'recent', 'walletConnect'],
  },
  metadata,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})
