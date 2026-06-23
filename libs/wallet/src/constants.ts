import { SupportedChainId } from '@cowprotocol/cow-sdk'

import type { CaipNetworkId } from '@reown/appkit'

/** Custom event name for "open wallet modal". Dispatched by the app; handled in Web3Provider to open Reown (AppKit). */
export const OPEN_WALLET_MODAL_EVENT = 'cowswap-open-wallet-modal'

export const WC_DISABLED_TEXT =
  'Wallet-connect based wallet is already in use. Please disconnect it to connect to this wallet.'

export const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID || 'a6cc11517a10f6f12953fd67b1eb67e7'

export const COINBASE_WALLET_RDNS = 'com.coinbase.wallet'

export const TRUST_WALLET_RDNS = 'com.trustwallet.app'

export const METAMASK_RDNS = 'io.metamask'

export const RABBY_RDNS = 'io.rabby'

export const BRAVE_WALLET_RDNS = 'com.brave.wallet'

export const WATCH_ASSET_SUPPORED_WALLETS = [METAMASK_RDNS, RABBY_RDNS, BRAVE_WALLET_RDNS]

// TODO: move to SDK
export const SUPPORTED_CHAIN_ID_TO_CAIP: Record<SupportedChainId, CaipNetworkId> = {
  [SupportedChainId.MAINNET]: 'eip155:1',
  [SupportedChainId.BNB]: 'eip155:56',
  [SupportedChainId.GNOSIS_CHAIN]: 'eip155:100',
  [SupportedChainId.POLYGON]: 'eip155:137',
  [SupportedChainId.BASE]: 'eip155:8453',
  [SupportedChainId.PLASMA]: 'eip155:9745',
  [SupportedChainId.ARBITRUM_ONE]: 'eip155:42161',
  [SupportedChainId.AVALANCHE]: 'eip155:43114',
  [SupportedChainId.INK]: 'eip155:57073',
  [SupportedChainId.LINEA]: 'eip155:59144',
  [SupportedChainId.SEPOLIA]: 'eip155:11155111',
  [SupportedChainId.SOLANA]: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
}

export const CAIP_TO_SUPPORTED_CHAIN_ID: Record<CaipNetworkId, SupportedChainId> = {
  'eip155:1': SupportedChainId.MAINNET,
  'eip155:56': SupportedChainId.BNB,
  'eip155:100': SupportedChainId.GNOSIS_CHAIN,
  'eip155:137': SupportedChainId.POLYGON,
  'eip155:8453': SupportedChainId.BASE,
  'eip155:9745': SupportedChainId.PLASMA,
  'eip155:42161': SupportedChainId.ARBITRUM_ONE,
  'eip155:43114': SupportedChainId.AVALANCHE,
  'eip155:57073': SupportedChainId.INK,
  'eip155:59144': SupportedChainId.LINEA,
  'eip155:11155111': SupportedChainId.SEPOLIA,
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': SupportedChainId.SOLANA,
}

export const SAFE_APP_ORIGIN = 'https://app.safe.global'
