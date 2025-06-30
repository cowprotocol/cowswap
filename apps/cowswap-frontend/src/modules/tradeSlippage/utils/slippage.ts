import {
  DEFAULT_SLIPPAGE_BPS,
  MAX_DEFAULT_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS
} from '@cowprotocol/common-const'
import { clampValue } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FlexibleSlippageConfig, resolveFlexibleConfig, SlippageConfig } from '@cowprotocol/widget-lib'
import { TradeType } from '@cowprotocol/widget-lib'

export function resolveFlexibleSlippageConfig(
  config: FlexibleSlippageConfig | undefined,
  chainId: SupportedChainId,
  tradeType: TradeType | undefined,
  isEthFlow: boolean
): Required<SlippageConfig> {
  const minEthSlippageBps = MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId]

  const defaultConfig = {
    min: isEthFlow ? minEthSlippageBps : MIN_SLIPPAGE_BPS,
    max: MAX_DEFAULT_SLIPPAGE_BPS,
    defaultValue: isEthFlow ? minEthSlippageBps : DEFAULT_SLIPPAGE_BPS,
    disableAutoSlippage: false,
  }

  if (!config || !tradeType) {
    return defaultConfig
  }

  const resolvedConfig = resolveFlexibleConfig(config, chainId, tradeType)
  if (!resolvedConfig) return defaultConfig

  const min = resolvedConfig.min ?? defaultConfig.min
  const max = resolvedConfig.max ?? defaultConfig.max
  const defaultValue = resolvedConfig.defaultValue ?? defaultConfig.defaultValue

  return {
    min,
    max,
    defaultValue: clampValue(defaultValue, min, max),
    disableAutoSlippage: resolvedConfig.disableAutoSlippage ?? defaultConfig.disableAutoSlippage,
  }
}
