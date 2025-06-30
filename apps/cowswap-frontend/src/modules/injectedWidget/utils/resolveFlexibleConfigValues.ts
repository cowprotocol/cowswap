import { FlexibleConfig, isPerNetworkConfig, isPerTradeTypeConfig } from '@cowprotocol/widget-lib'

export function resolveFlexibleConfigValues<T extends string | number>(config: FlexibleConfig<T>): T[] {
  if (isPerTradeTypeConfig(config)) {
    return Object.values(config)
      .map((value) => (isPerNetworkConfig(value) ? Object.values(value) : value))
      .flat()
  }

  if (isPerNetworkConfig(config)) {
    return Object.values(config)
      .map((value) => (isPerTradeTypeConfig(value) ? Object.values(value) : value))
      .flat()
  }

  return [config] as T[]
}
