import {
  INPUT_OUTPUT_EXPLANATION,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
  PERCENTAGE_PRECISION,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getNonNativeOrderDeadlineTooltip() {
  return (
    <Trans>
      Your swap expires and will not execute if it is pending for longer than the selected duration.
      <br />
      <br />
      {INPUT_OUTPUT_EXPLANATION}
    </Trans>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getNativeSlippageTooltip = (chainId: SupportedChainId, symbols: (string | undefined)[] | undefined) => (
  <Trans>
    When selling {symbols?.[0] || 'a native currency'}, the minimum slippage tolerance is set to{' '}
    {MINIMUM_ETH_FLOW_SLIPPAGE[chainId].toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order
    matching, even in volatile market conditions.
    <br />
    <br />
    {symbols?.[0] || 'Native currency'} orders can, in rare cases, be frontrun due to their on-chain component. For more
    robust MEV protection, consider wrapping your {symbols?.[0] || 'native currency'} before trading.
  </Trans>
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getNonNativeSlippageTooltip = (params?: { isDynamic?: boolean; isSettingsModal?: boolean }) => (
  <Trans>
    {params?.isDynamic ? (
      <>
        CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting
        the best price.{' '}
        {params?.isSettingsModal ? (
          <>
            To override this, enter your desired slippage amount.
            <br />
            <br />
            Either way, your slippage is protected from MEV!
          </>
        ) : (
          <>
            <br />
            <br />
            Trades are protected from MEV, so your slippage can't be exploited!
          </>
        )}
      </>
    ) : (
      <>CoW Swap trades are protected from MEV, so your slippage can't be exploited!</>
    )}
  </Trans>
)
