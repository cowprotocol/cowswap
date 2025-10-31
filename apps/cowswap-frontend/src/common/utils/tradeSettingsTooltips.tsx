import { ReactNode } from 'react'

import {
  INPUT_OUTPUT_EXPLANATION,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
  PERCENTAGE_PRECISION,
} from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined): ReactNode {
  const symbolName = symbols?.[0] || t`Native currency (e.g ETH)`
  const minutes = MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60

  return (
    <>
      <Trans>
        {symbolName} orders require a minimum transaction expiration time threshold of {minutes} minutes to ensure the
        best swapping experience
      </Trans>
      <br />
      <br />
      <Trans>Orders not matched after the threshold time are automatically refunded.</Trans>
    </>
  )
}

export function getNonNativeOrderDeadlineTooltip(): ReactNode {
  return (
    <>
      <Trans>Your swap expires and will not execute if it is pending for longer than the selected duration.</Trans>
      <br />
      <br />
      {i18n._(INPUT_OUTPUT_EXPLANATION)}
    </>
  )
}

export const getNativeSlippageTooltip = (symbols: (string | undefined)[] | undefined): ReactNode => {
  const minimumETHFlowSlippage = MINIMUM_ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)
  const aNativeCurrency = symbols?.[0] || t`a native currency`
  const currencyNameCapitalized = symbols?.[0] || t`Native currency`
  const currencyName = symbols?.[0] || t`native currency`

  return (
    <>
      <Trans>
        When selling {aNativeCurrency}, the minimum slippage tolerance is set to {minimumETHFlowSlippage}% or higher to
        ensure a high likelihood of order matching, even in volatile market conditions.
      </Trans>
      <br />
      <br />
      <Trans>
        {currencyNameCapitalized} orders can, in rare cases, be frontrun due to their on-chain component. For more
        robust MEV protection, consider wrapping your {currencyName} before trading.
      </Trans>
    </>
  )
}

export const getNonNativeSlippageTooltip = (params?: { isDynamic?: boolean; isSettingsModal?: boolean }): ReactNode => (
  <>
    {params?.isDynamic ? (
      <>
        <Trans>
          CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting
          the best price.
        </Trans>{' '}
        {params?.isSettingsModal ? (
          <>
            <Trans>
              To override this, enter your desired slippage amount.
              <br />
              <br />
              Either way, your slippage is protected from MEV!
            </Trans>
          </>
        ) : (
          <>
            <Trans>
              <br />
              <br />
              Trades are protected from MEV, so your slippage can't be exploited!
            </Trans>
          </>
        )}
      </>
    ) : (
      <>
        <Trans>CoW Swap trades are protected from MEV, so your slippage can't be exploited!</Trans>
      </>
    )}
  </>
)
