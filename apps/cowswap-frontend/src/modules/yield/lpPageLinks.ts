import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { LpTokenProvider } from '@cowprotocol/types'

const COW_AMM_CHAINS = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosis',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

const UNI_CHAINS = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

const SUSHI_CHAINS = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosis',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

const PANCAKE_CHAINS = {
  [SupportedChainId.MAINNET]: 'eth',
  [SupportedChainId.GNOSIS_CHAIN]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'arb',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
}

export const LP_PAGE_LINKS: Record<LpTokenProvider, (chainId: SupportedChainId, address: string) => string> = {
  [LpTokenProvider.COW_AMM]: (chainId, address) =>
    `https://balancer.fi/pools/${COW_AMM_CHAINS[chainId]}/cow/${address}`,
  [LpTokenProvider.UNIV2]: (chainId, address) =>
    `https://app.uniswap.org/explore/pools/${UNI_CHAINS[chainId]}/${address}`,
  [LpTokenProvider.CURVE]: () => `https://classic.curve.finance/pools`,
  [LpTokenProvider.BALANCERV2]: () => `https://balancer.fi/pools`,
  [LpTokenProvider.SUSHI]: (chainId, address) => `https://www.sushi.com/${SUSHI_CHAINS[chainId]}/pool/v2/${address}`,
  [LpTokenProvider.PANCAKE]: (chainId, address) =>
    `https://pancakeswap.finance/liquidity/pool/${PANCAKE_CHAINS[chainId]}/${address}`,
}
