import {
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SlippageConfig } from '@cowprotocol/widget-lib'

export function getMinSlippage(
  currentFlowSlippage: SlippageConfig | undefined,
  chainId: SupportedChainId,
  isEoaEthFlow: boolean
): number {
  if (currentFlowSlippage?.[chainId]?.min) {
    return currentFlowSlippage[chainId].min
  }

  return isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : MIN_SLIPPAGE_BPS
}

export function getMaxSlippage(currentFlowSlippage: SlippageConfig | undefined, chainId: SupportedChainId): number {
  return currentFlowSlippage?.[chainId]?.max ?? MAX_SLIPPAGE_BPS
}

export function getDefaultSlippage(
  currentFlowSlippage: SlippageConfig | undefined,
  chainId: SupportedChainId,
  isEoaEthFlow: boolean
): number {
  if (currentFlowSlippage?.[chainId]?.defaultValue) {
    return currentFlowSlippage[chainId].defaultValue
  }

  return isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId] : DEFAULT_SLIPPAGE_BPS
}
