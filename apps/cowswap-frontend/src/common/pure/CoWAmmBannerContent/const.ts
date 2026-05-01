import iconCurveSrc from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import iconPancakeswapSrc from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import iconSushiSrc from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import iconUniSrc from '@cowprotocol/assets/cow-swap/icon-uni.svg'
import { LpTokenProvider } from '@cowprotocol/types'

export const LP_PROVIDER_NAMES: Record<LpTokenProvider, string> = {
  [LpTokenProvider.UNIV2]: 'UNI-V2',
  [LpTokenProvider.SUSHI]: 'Sushi',
  [LpTokenProvider.PANCAKE]: 'PancakeSwap',
  [LpTokenProvider.CURVE]: 'Curve',
  [LpTokenProvider.COW_AMM]: 'CoW AMM',
  [LpTokenProvider.BALANCERV2]: 'Balancer',
}

export const LP_PROVIDER_ICONS: Record<LpTokenProvider, string> = {
  [LpTokenProvider.UNIV2]: iconUniSrc,
  [LpTokenProvider.SUSHI]: iconSushiSrc,
  [LpTokenProvider.PANCAKE]: iconPancakeswapSrc,
  [LpTokenProvider.CURVE]: iconCurveSrc,
  [LpTokenProvider.COW_AMM]: '',
  [LpTokenProvider.BALANCERV2]: '',
}
