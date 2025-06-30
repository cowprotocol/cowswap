import { FlexibleConfig, isPerNetworkConfig, isPerTradeTypeConfig } from '@cowprotocol/widget-lib'

export function resolveFlexibleConfigValues<T>(config: FlexibleConfig<T>): T[] {
  if (isPerTradeTypeConfig(config)) {
    return Object.values(config)
      .flatMap((value) => (isPerNetworkConfig(value) ? Object.values(value) : [value]))
  }

  if (isPerNetworkConfig(config)) {
    return Object.values(config)
      .flatMap((value) => (isPerTradeTypeConfig(value) ? Object.values(value) : [value]))
  }

  return [config] as T[]
}
