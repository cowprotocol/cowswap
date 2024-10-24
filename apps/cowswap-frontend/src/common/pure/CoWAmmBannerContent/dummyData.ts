export enum LpToken {
  UniswapV2 = 'UniswapV2',
  Sushiswap = 'Sushiswap',
  PancakeSwap = 'PancakeSwap',
  Curve = 'Curve',
}

type BaseScenario = {
  readonly apr: number
  readonly comparison: string
  readonly hasCoWAmmPool: boolean
}

export type TwoLpScenario = BaseScenario & {
  readonly uniV2Apr: number
  readonly sushiApr: number
}

export type InferiorYieldScenario = BaseScenario & {
  readonly poolsCount: number
}

export type DummyDataType = {
  noLp: BaseScenario
  uniV2Superior: BaseScenario
  uniV2Inferior: BaseScenario
  sushi: BaseScenario
  curve: BaseScenario
  pancake: BaseScenario & { readonly isYieldSuperior: boolean }
  twoLpsMixed: TwoLpScenario
  twoLpsBothSuperior: TwoLpScenario
  threeLps: BaseScenario
  fourLps: BaseScenario
  uniV2InferiorWithLowAverageYield: InferiorYieldScenario
}

export const dummyData: DummyDataType = {
  noLp: {
    apr: 1.5,
    comparison: 'average UNI-V2 pool',
    hasCoWAmmPool: false,
  },
  uniV2Superior: {
    apr: 2.1,
    comparison: 'UNI-V2',
    hasCoWAmmPool: true,
  },
  uniV2Inferior: {
    apr: 1.2,
    comparison: 'UNI-V2',
    hasCoWAmmPool: true,
  },
  sushi: {
    apr: 1.8,
    comparison: 'SushiSwap',
    hasCoWAmmPool: true,
  },
  curve: {
    apr: 1.3,
    comparison: 'Curve',
    hasCoWAmmPool: true,
  },
  pancake: {
    apr: 2.5,
    comparison: 'PancakeSwap',
    hasCoWAmmPool: true,
    isYieldSuperior: true,
  },
  twoLpsMixed: {
    apr: 2.5,
    comparison: 'UNI-V2 and SushiSwap',
    hasCoWAmmPool: true,
    uniV2Apr: 3.0,
    sushiApr: 1.8,
  } as TwoLpScenario,
  twoLpsBothSuperior: {
    apr: 3.2,
    comparison: 'UNI-V2 and SushiSwap',
    hasCoWAmmPool: true,
    uniV2Apr: 3.5,
    sushiApr: 2.9,
  } as TwoLpScenario,
  threeLps: {
    apr: 2.2,
    comparison: 'UNI-V2, SushiSwap, and Curve',
    hasCoWAmmPool: false,
  },
  fourLps: {
    apr: 2.4,
    comparison: 'UNI-V2, SushiSwap, Curve, and PancakeSwap',
    hasCoWAmmPool: false,
  },
  uniV2InferiorWithLowAverageYield: {
    apr: 1.2,
    comparison: 'UNI-V2',
    hasCoWAmmPool: true,
    poolsCount: 195,
  },
}

export type StateKey = keyof typeof dummyData

export const lpTokenConfig: Record<StateKey, LpToken[]> = {
  noLp: [],
  uniV2Superior: [LpToken.UniswapV2],
  uniV2Inferior: [LpToken.UniswapV2],
  sushi: [LpToken.Sushiswap],
  curve: [LpToken.Curve],
  pancake: [LpToken.PancakeSwap],
  twoLpsMixed: [LpToken.UniswapV2, LpToken.Sushiswap],
  twoLpsBothSuperior: [LpToken.UniswapV2, LpToken.Sushiswap],
  threeLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve],
  fourLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve, LpToken.PancakeSwap],
  uniV2InferiorWithLowAverageYield: [LpToken.UniswapV2],
}
