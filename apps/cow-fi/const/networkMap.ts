export const NETWORK_MAP = {
  ethereum: 'Ethereum',
  base: 'Base',
  'arbitrum-one': 'Arbitrum',
  avalanche: 'Avalanche',
  'polygon-pos': 'Polygon',
  xdai: 'Gnosis Chain',
}

export const NETWORK_ID_MAP: Record<Network, number> = {
  ethereum: 1,
  base: 8453,
  'arbitrum-one': 42161,
  avalanche: 43114,
  'polygon-pos': 137,
  xdai: 100,
}

export const NETWORK_IMAGE_MAP: Record<Network, string> = {
  ethereum: '/images/ethereum.svg',
  base: '/images/base-chain.svg',
  'arbitrum-one': '/images/arbitrum-chain.svg',
  avalanche: '/images/avalanche-chain.svg',
  'polygon-pos': '/images/polygon-chain.svg',
  xdai: '/images/gnosis-chain.svg',
}

export const NETWORK_URL_MAP: Record<Network, string> = {
  ethereum: 'https://etherscan.io/address/',
  base: 'https://basescan.org/address/',
  'arbitrum-one': 'https://arbiscan.io/address/',
  avalanche: 'https://snowscan.xyz/address/',
  'polygon-pos': 'https://polygonscan.com/address/',
  xdai: 'https://gnosisscan.io/address/',
}

export const NETWORK_DEFAULT_SELL_TOKEN_MAP: Record<Network, string> = {
  ethereum: 'WETH',
  base: 'WETH',
  'arbitrum-one': 'WETH',
  avalanche: 'WAVAX',
  'polygon-pos': 'WPOL',
  xdai: 'WXDAI',
}

export const NETWORK_DEFAULT_BUY_TOKEN_MAP: Record<Network, string> = {
  ethereum: 'WETH',
  base: 'WETH',
  'arbitrum-one': 'WETH',
  avalanche: 'WAVAX',
  'polygon-pos': 'WPOL',
  xdai: 'WXDAI',
}

export type Network = keyof typeof NETWORK_MAP
