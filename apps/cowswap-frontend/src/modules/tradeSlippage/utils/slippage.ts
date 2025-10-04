import {
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS,
} from '@cowprotocol/common-const'
import { clampValue } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FlexibleSlippageConfig, resolveFlexibleConfig, SlippageConfig } from '@cowprotocol/widget-lib'
import { TradeType } from '@cowprotocol/widget-lib'

export function resolveSlippageConfig(
  config: FlexibleSlippageConfig | undefined,
  chainId: SupportedChainId,
  tradeType: TradeType | undefined,
  isEthFlow: boolean,
): Required<SlippageConfig> {
  const applicationConfig = {
    min: isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : MIN_SLIPPAGE_BPS,
    max: MAX_SLIPPAGE_BPS,
    defaultValue: DEFAULT_SLIPPAGE_BPS,
  }

  if (!config || !tradeType) {
    return applicationConfig
  }

  const resolvedConfig = resolveFlexibleConfig(config, chainId, tradeType)
  if (!resolvedConfig) return applicationConfig

  const min = Math.max(resolvedConfig.min ?? applicationConfig.min, applicationConfig.min)
  const max = Math.min(resolvedConfig.max ?? applicationConfig.max, applicationConfig.max)
  const defaultValue = resolvedConfig.defaultValue ?? applicationConfig.defaultValue

  return {
    min,
    max,
    defaultValue: clampValue(defaultValue, min, max),
  }
}
