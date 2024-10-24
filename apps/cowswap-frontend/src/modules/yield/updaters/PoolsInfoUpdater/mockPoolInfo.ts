import { LpTokenProvider } from '@cowprotocol/types'

import { PoolInfo } from '../../state/poolsInfoAtom'

const MOCK_POOL_INFO_OVERRIDE = localStorage.getItem('MOCK_POOL_INFO')
const POOLS_AVERAGE_DATA_MOCK_OVERRIDE = localStorage.getItem('POOLS_AVERAGE_DATA_MOCK')

export const MOCK_POOL_INFO: Record<string, PoolInfo> = MOCK_POOL_INFO_OVERRIDE
  ? JSON.parse(MOCK_POOL_INFO_OVERRIDE)
  : {
      // Sushi AAVE/WETH
      '0xd75ea151a61d06868e31f8988d28dfe5e9df57b4': {
        apy: 1.89,
        tvl: 157057,
        feeTier: 0.3,
        volume24h: 31.19,
      },
      // CoW AMM AAVE/WETH
      '0xf706c50513446d709f08d3e5126cd74fb6bfda19': {
        apy: 0.07,
        tvl: 52972,
        feeTier: 0.3,
        volume24h: 10,
      },
    }

export const POOLS_AVERAGE_DATA_MOCK: Partial<Record<LpTokenProvider, { apy: number }>> =
  POOLS_AVERAGE_DATA_MOCK_OVERRIDE
    ? JSON.parse(POOLS_AVERAGE_DATA_MOCK_OVERRIDE)
    : {
        [LpTokenProvider.COW_AMM]: {
          apy: 0.3,
        },
        [LpTokenProvider.UNIV2]: {
          apy: 3.1,
        },
        [LpTokenProvider.CURVE]: {
          apy: 0.4,
        },
        [LpTokenProvider.PANCAKE]: {
          apy: 0.2,
        },
        [LpTokenProvider.SUSHI]: {
          apy: 0.41,
        },
      }
