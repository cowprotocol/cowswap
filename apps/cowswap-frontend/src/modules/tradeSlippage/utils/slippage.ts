import {
  DEFAULT_SLIPPAGE_BPS,
  MAX_DEFAULT_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { resolveFlexibleConfig, SlippageConfig } from '@cowprotocol/widget-lib'
import { TradeType } from '@cowprotocol/widget-lib'

export function getMinSlippage(
  config: SlippageConfig | undefined,
  chainId: SupportedChainId,
  isEoaEthFlow: boolean,
  tradeType: TradeType | undefined,
): number {
  const defaultMinSlippagePerFlow = isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : MIN_SLIPPAGE_BPS
  if (!config || !tradeType) return defaultMinSlippagePerFlow

  const valueFromConfig = resolveFlexibleConfig(config.min, chainId, tradeType)
  if (typeof valueFromConfig === 'number') return valueFromConfig

  return defaultMinSlippagePerFlow
}

export function getMaxSlippage(
  config: SlippageConfig | undefined,
  chainId: SupportedChainId,
  tradeType: TradeType | undefined,
): number {
  if (!config || !tradeType) return MAX_DEFAULT_SLIPPAGE_BPS

  return resolveFlexibleConfig(config.max, chainId, tradeType) || MAX_DEFAULT_SLIPPAGE_BPS
}

export function getDefaultSlippage(
  config: SlippageConfig | undefined,
  chainId: SupportedChainId,
  tradeType: TradeType | undefined,
  isEoaEthFlow: boolean
): number {
  const defaultSlippagePerFlow = isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS
  if (!config || !tradeType) return defaultSlippagePerFlow

  const valueFromConfig = resolveFlexibleConfig(config.defaultValue, chainId, tradeType)

  return typeof valueFromConfig === 'number'
    ? valueFromConfig
    : defaultSlippagePerFlow
}

export function getIsAutoSlippageDisabled(
  config: SlippageConfig | undefined,
  chainId: SupportedChainId,
  tradeType: TradeType | undefined
): boolean {
  if (!config || !tradeType) return false
  return !!resolveFlexibleConfig(config.disableAutoSlippage, chainId, tradeType)
}
