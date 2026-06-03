import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, EvmChains, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { ConnectorController } from '@reown/appkit-controllers'
import { coinbaseWallet } from '@wagmi/connectors'
import { http } from 'viem'

import type { AppKitNetwork } from '@reown/appkit/networks'
import type { Transport } from 'wagmi'

/**
 * RPC URL for a given chain, used by AppKit's UI (balance display, ENS) and by wagmi
 * for any non-wallet contract reads:
 *
 * 1. `REACT_APP_NETWORK_URL_<chainId>` env var if set (e.g. `REACT_APP_NETWORK_URL_1` for
 *    mainnet). Same convention as `libs/common-const/networks.ts`.
 * 2. The viem chain's built-in default public RPC (e.g. `eth.merkle.io` for mainnet).
 *
 * We deliberately do NOT fall back to `RPC_URLS` from `@cowprotocol/common-const` — those
 * route through a shared rate-limited Infura key that returns 429s, causing wagmi's
 * `getBalance` to throw, which makes AppKit display `0.000 ETH` (the adapter's error
 * fallback) instead of the real balance.
 */
const EVM_SUPPORTED_CHAIN_IDS = (ALL_SUPPORTED_CHAIN_IDS as readonly number[]).filter(isEvmChain)

function getRpcUrl(chainId: EvmChains): string | undefined {
  const envOverride = process.env[`REACT_APP_NETWORK_URL_${chainId}`]
  return envOverride || VIEM_CHAINS[chainId]?.rpcUrls?.default?.http?.[0]
}

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
// Match cowswap-frontend's registered Reown Cloud project. The default public
// projectId returns limited wallet-registry data (no mobile_link/desktop_link),
// which makes AppKit's connecting view route Coinbase Wallet to the "Not
// Detected / Get extension" screen instead of the QR/deeplink view. Using the
// same registered project as cowswap-frontend gets the full registry data.
const WC_DEFAULT_PROJECT_ID = 'ac287751638b5d374a03c39e37f70376'
const projectId = WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID

const metadata = {
  name: 'CoW Widget Configurator',
  description: 'Injectable UI of CoWSwap',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon.png'],
}

// AppKit ships its own AppKit-shaped networks (re-exporting viem/chains under the hood,
// plus the metadata its UI layer needs). Cast to AppKitNetwork to bridge the nominal
// type difference between this project's pinned viem and AppKit's peer.
const networks = EVM_SUPPORTED_CHAIN_IDS.map((chainId) => VIEM_CHAINS[chainId] as unknown as AppKitNetwork) as [
  AppKitNetwork,
  ...AppKitNetwork[],
]

const transports = EVM_SUPPORTED_CHAIN_IDS.reduce(
  (acc, chainId) => {
    const url = getRpcUrl(chainId)
    if (url) acc[chainId] = http(url)
    return acc
  },
  {} as Record<EvmChains, Transport>,
)

const customRpcUrls = EVM_SUPPORTED_CHAIN_IDS.reduce<Record<string, Array<{ url: string }>>>((acc, chainId) => {
  const url = getRpcUrl(chainId)
  if (url) acc[`eip155:${chainId}`] = [{ url }]
  return acc
}, {})

// The Reown wallet-registry returns TWO Coinbase Wallet entries:
//   - 'fd20...' "Base (formerly Coinbase Wallet)" — the canonical entry; AppKit's
//     PresetsUtil maps the `coinbaseWalletSDK` connector → this explorerId, so
//     clicking it opens keys.coinbase.com via the Coinbase Wallet SDK.
//   - 'd0ca99...' "Coinbase Wallet" — a second entry surfaced via recommended/search
//     with empty `mobile_link`/`webapp_link`/`desktop_link` and no connector mapped to
//     its id. Clicking it routes through AppKit's WalletConnect flow, finds no platform
//     link, and lands on the "Not Detected" screen.
// Both entries describe the same wallet, so we route clicks on the second entry to the
// canonical SDK connector. Done via `ConnectorController.getConnector` patch below —
// avoids creating a second wagmi connector (which would surface a duplicate "Coinbase
// Wallet" tile in the modal via AppKit's connector-list rendering).
const COINBASE_LEGACY_WALLET_ID = 'd0ca99ff52b99abc48743dad0f7fc891e041be73574f7fac4afe5d4bb83845c8'

export const wagmiAdapter = new WagmiAdapter({
  connectors: [coinbaseWallet({ preference: { options: 'all' } })],
  customRpcUrls,
  networks,
  projectId,
  transports,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// Warm up the Coinbase Wallet SDK provider before AppKit's `addWagmiConnector` awaits it.
// `coinbaseWallet.getProvider()` dynamically imports `@coinbase/wallet-sdk` and instantiates
// the provider; AppKit blocks on this await before registering the connector in its
// `state.allConnectors`. If the user clicks "Coinbase Wallet" while that promise is still
// pending, `ConnectorController.getConnector({ id: walletId })` returns undefined and
// AppKit falls through to the WalletConnect route — landing on the "Not Detected" screen.
if (typeof window !== 'undefined') {
  const coinbaseConnector = wagmiAdapter.wagmiConfig.connectors.find((c) => c.id === 'coinbaseWalletSDK')
  void coinbaseConnector?.getProvider?.().catch(() => undefined)

  const originalGetConnector = ConnectorController.getConnector.bind(ConnectorController)
  ConnectorController.getConnector = (params) => {
    const match = originalGetConnector(params)
    if (match) return match
    if (params.id === COINBASE_LEGACY_WALLET_ID) {
      return originalGetConnector({ id: 'coinbaseWalletSDK', namespace: params.namespace })
    }
    return undefined
  }
}

export const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: networks.find((n) => n.id === SupportedChainId.MAINNET),
  enableEIP6963: true,
  enableWalletGuide: false,
  featuredWalletIds: ['fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'],
  metadata,
  networks,
  projectId,
  features: {
    analytics: false,
    connectorTypeOrder: ['injected', 'recent', 'walletConnect'],
  },
})
