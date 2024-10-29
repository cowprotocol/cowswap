import React from 'react'

import { DummyDataType, InferiorYieldScenario, LpToken, StateKey, TwoLpScenario } from '../dummyData'
import { PoolInfo } from '../PoolInfo'

const lpTokenNames: Record<LpToken, string> = {
  [LpToken.UniswapV2]: 'UNI-V2',
  [LpToken.Sushiswap]: 'Sushi',
  [LpToken.PancakeSwap]: 'PancakeSwap',
  [LpToken.Curve]: 'Curve',
}

function isTwoLpScenario(scenario: DummyDataType[keyof DummyDataType]): scenario is TwoLpScenario {
  return 'uniV2Apr' in scenario && 'sushiApr' in scenario
}

function isInferiorYieldScenario(scenario: DummyDataType[keyof DummyDataType]): scenario is InferiorYieldScenario {
  return 'poolsCount' in scenario
}

interface ComparisonMessageProps {
  data: DummyDataType[keyof DummyDataType]
  isDarkMode: boolean
  isTokenSelectorView: boolean
  selectedState: StateKey
  tokens: LpToken[]
}

export function ComparisonMessage({
  data,
  tokens,
  selectedState,
  isDarkMode,
  isTokenSelectorView,
}: ComparisonMessageProps) {
  if (isTwoLpScenario(data)) {
    if (selectedState === 'twoLpsMixed') {
      return <PoolInfo poolName="UNI-V2" isDarkMode={isDarkMode} isTokenSelectorView={isTokenSelectorView} />
    } else if (selectedState === 'twoLpsBothSuperior') {
      const { uniV2Apr, sushiApr } = data
      const higherAprPool = uniV2Apr > sushiApr ? 'UNI-V2' : 'SushiSwap'

      return <PoolInfo poolName={higherAprPool} isDarkMode={isDarkMode} isTokenSelectorView={isTokenSelectorView} />
    }
  }

  if (selectedState === 'uniV2Superior') {
    return <PoolInfo poolName="UNI-V2" isDarkMode={isDarkMode} isTokenSelectorView={isTokenSelectorView} />
  }

  if (selectedState === 'uniV2InferiorWithLowAverageYield' && isInferiorYieldScenario(data)) {
    return 'pools available to get yield on your assets!'
  }

  if (data.hasCoWAmmPool) {
    return `yield over average ${data.comparison} pool`
  } else {
    if (tokens.length > 1) {
      const tokenNames = tokens.map((token) => lpTokenNames[token]).filter(Boolean)

      return `yield over average ${tokenNames.join(', ')} pool${tokenNames.length > 1 ? 's' : ''}`
    } else {
      return `yield over average UNI-V2 pool`
    }
  }
}
