export const NETWORK_MAP = {
  ethereum: 'Ethereum',
  base: 'Base',
  'arbitrum-one': 'Arbitrum',
  avalanche: 'Avalanche',
  'polygon-pos': 'Polygon',
  xdai: 'Gnosis Chain',
}

export const NETWORK_IMAGE_MAP: Record<keyof typeof NETWORK_MAP, string> = {
  ethereum: '/images/ethereum.svg',
  base: '/images/base-chain.svg',
  'arbitrum-one': '/images/arbitrum-chain.svg',
  avalanche: '/images/avalanche-chain.svg',
  'polygon-pos': '/images/polygon-chain.svg',
  xdai: '/images/gnosis-chain.svg',
}

export const NETWORK_URL_MAP: Record<keyof typeof NETWORK_MAP, string> = {
  ethereum: 'https://etherscan.io/address/',
  base: 'https://basescan.org/address/',
  'arbitrum-one': 'https://arbiscan.io/address/',
  avalanche: 'https://snowscan.xyz/address/',
  'polygon-pos': 'https://polygonscan.com/address/',
  xdai: 'https://gnosisscan.io/address/',
}
