import {
  INPUT_OUTPUT_EXPLANATION,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
  PERCENTAGE_PRECISION,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined) {
  return (
    <Trans>
      {symbols?.[0] || 'Native currency (e.g ETH)'} orders require a minimum transaction expiration time threshold of{' '}
      {MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60} minutes to ensure the best swapping experience.
      <br />
      <br />
      Orders not matched after the threshold time are automatically refunded.
    </Trans>
  )
}

export function getNonNativeOrderDeadlineTooltip() {
  return (
    <Trans>
      Your swap expires and will not execute if it is pending for longer than the selected duration.
      {INPUT_OUTPUT_EXPLANATION}
    </Trans>
  )
}

export const getNativeSlippageTooltip = (chainId: SupportedChainId, symbols: (string | undefined)[] | undefined) => (
  <Trans>
    When selling {symbols?.[0] || 'a native currency'}, the minimum slippage tolerance is set to{' '}
    {MINIMUM_ETH_FLOW_SLIPPAGE[chainId].toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order
    matching, even in volatile market conditions.
    <br />
    <br />
    Orders on CoW Swap are always protected from MEV, so your slippage tolerance cannot be exploited.
  </Trans>
)

export const getNonNativeSlippageTooltip = () => (
  <Trans>
    Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.
    <br />
    <br />
    The slippage set enables a resubmission of your order in case of unfavourable price movements.
    <br />
    <br />
    {INPUT_OUTPUT_EXPLANATION}
  </Trans>
)
