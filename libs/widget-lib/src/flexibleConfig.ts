import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { FlexibleConfig, PerNetworkConfig, PerTradeTypeConfig, TradeType } from './types'

const TradeTypes = Object.values(TradeType)

export function resolveFlexibleConfig<T extends string | number>(
  config: FlexibleConfig<T>,
  chainId: SupportedChainId,
  tradeType: TradeType
): T | undefined {
  if (isPerTradeTypeConfig(config)) {
    const value = config[tradeType]

    return isPerNetworkConfig(value) ? value[chainId] : value
  }

  if (isPerNetworkConfig(config)) {
    const value = config[chainId]

    return isPerTradeTypeConfig(value) ? value[tradeType] : value
  }

  return config as T
}

export function isPerTradeTypeConfig<T>(config: FlexibleConfig<T>): config is PerTradeTypeConfig<T> {
  if (typeof config !== 'object') return false

  return Object.keys(config as object).every((key) => TradeTypes.includes(key as TradeType))
}

const D_REGEX = /^\d+$/

export function isPerNetworkConfig<T>(config: FlexibleConfig<T>): config is PerNetworkConfig<T> {
  if (typeof config !== 'object') return false

  return Object.keys(config as object).every((key) => typeof key === 'number' || D_REGEX.test(key))
}
