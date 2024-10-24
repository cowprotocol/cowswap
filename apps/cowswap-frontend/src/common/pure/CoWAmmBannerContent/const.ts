import ICON_CURVE from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import ICON_PANCAKESWAP from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import ICON_SUSHISWAP from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import ICON_UNISWAP from '@cowprotocol/assets/cow-swap/icon-uni.svg'
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
  [LpTokenProvider.UNIV2]: ICON_UNISWAP,
  [LpTokenProvider.SUSHI]: ICON_SUSHISWAP,
  [LpTokenProvider.PANCAKE]: ICON_PANCAKESWAP,
  [LpTokenProvider.CURVE]: ICON_CURVE,
  [LpTokenProvider.COW_AMM]: '',
  [LpTokenProvider.BALANCERV2]: '',
}
