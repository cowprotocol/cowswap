import { PoolInfo } from '../../state/poolsInfoAtom'

export const MOCK_POOL_INFO: Record<string, PoolInfo> = {
  // Sushi AAVE/WETH
  '0xd75ea151a61d06868e31f8988d28dfe5e9df57b4': {
    apy: 1.89,
    tvl: 157057,
    feeTier: 0.3,
    volume24h: 31.19,
  },
  // CoW AMM AAVE/WETH
  '0xf706c50513446d709f08d3e5126cd74fb6bfda19': {
    apy: 20.07,
    tvl: 52972,
    feeTier: 0.3,
    volume24h: 10,
  },
}
