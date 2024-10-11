export enum LpToken {
  UniswapV2 = 'UniswapV2',
  Sushiswap = 'Sushiswap',
  PancakeSwap = 'PancakeSwap',
  Curve = 'Curve',
}

export const dummyData = {
  noLp: { apr: 1.5, comparison: 'UNI-V2' },
  uniV2: { apr: 2.1, comparison: 'UNI-V2' },
  sushi: { apr: 1.8, comparison: 'SushiSwap' },
  curve: { apr: 1.3, comparison: 'Curve' },
  pancake: { apr: 2.5, comparison: 'PancakeSwap' },
  twoLps: { apr: 2.0, comparison: 'UNI-V2 and SushiSwap' },
  threeLps: { apr: 2.2, comparison: 'UNI-V2, SushiSwap, and Curve' },
  fourLps: { apr: 2.4, comparison: 'UNI-V2, Sushiswap, Curve, and Balancer' },
} as const

export type StateKey = keyof typeof dummyData

export const lpTokenConfig: Record<StateKey, LpToken[]> = {
  noLp: [LpToken.UniswapV2],
  uniV2: [LpToken.UniswapV2],
  sushi: [LpToken.Sushiswap],
  curve: [LpToken.Curve],
  pancake: [LpToken.PancakeSwap],
  twoLps: [LpToken.UniswapV2, LpToken.Sushiswap],
  threeLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve],
  fourLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve, LpToken.Curve],
}
