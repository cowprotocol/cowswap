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
  [SupportedChainId.LENS]: '',
  [SupportedChainId.BNB]: '',
  [SupportedChainId.LINEA]: '', // TODO: confirm
  [SupportedChainId.PLASMA]: '', // TODO: confirm
  [SupportedChainId.INK]: '', // TODO: confirm
}

// Reference: https://api-docs.uniswap.org/guides/supported_chains

const UNI_CHAINS = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
  [SupportedChainId.LENS]: '',
  [SupportedChainId.BNB]: 'bnb',
  [SupportedChainId.LINEA]: '', // TODO: confirm
  [SupportedChainId.PLASMA]: '', // TODO: confirm
  [SupportedChainId.INK]: '',
}

// Reference: https://www.sushi.com/faq/general/about-sushi/which-chains-are-sushi-on

const SUSHI_CHAINS = {
  [SupportedChainId.MAINNET]: 'ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosis',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.AVALANCHE]: 'avalanche',
  [SupportedChainId.LENS]: '',
  [SupportedChainId.BNB]: 'bsc',
  [SupportedChainId.LINEA]: '', // TODO: confirm. This one is actually supported.
  [SupportedChainId.PLASMA]: '', // TODO: confirm
  [SupportedChainId.INK]: '',
}

// Reference: https://pancakeswap.finance/info/linea

const PANCAKE_CHAINS = {
  [SupportedChainId.MAINNET]: 'eth',
  [SupportedChainId.GNOSIS_CHAIN]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'arb',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.POLYGON]: '',
  [SupportedChainId.AVALANCHE]: '',
  [SupportedChainId.LENS]: '',
  [SupportedChainId.BNB]: 'bsc',
  [SupportedChainId.LINEA]: '', // TODO: confirm. This one is actually supported.
  [SupportedChainId.PLASMA]: '', // TODO: confirm
  [SupportedChainId.INK]: '',
}

export const LP_PAGE_LINKS: Record<LpTokenProvider, (chainId: SupportedChainId, address: string) => string | null> = {
  [LpTokenProvider.COW_AMM]: (chainId, address) =>
    COW_AMM_CHAINS[chainId] ? `https://balancer.fi/pools/${COW_AMM_CHAINS[chainId]}/cow/${address}` : null,
  [LpTokenProvider.UNIV2]: (chainId, address) =>
    UNI_CHAINS[chainId] ? `https://app.uniswap.org/explore/pools/${UNI_CHAINS[chainId]}/${address}` : null,
  [LpTokenProvider.CURVE]: () => `https://classic.curve.finance/pools`,
  [LpTokenProvider.BALANCERV2]: () => `https://balancer.fi/pools`,
  [LpTokenProvider.SUSHI]: (chainId, address) =>
    SUSHI_CHAINS[chainId] ? `https://www.sushi.com/${SUSHI_CHAINS[chainId]}/pool/v2/${address}` : null,
  [LpTokenProvider.PANCAKE]: (chainId, address) =>
    PANCAKE_CHAINS[chainId] ? `https://pancakeswap.finance/liquidity/pool/${PANCAKE_CHAINS[chainId]}/${address}` : null,
}
