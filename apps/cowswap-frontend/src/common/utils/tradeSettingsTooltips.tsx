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
import { SlippageWarningParams } from 'modules/tradeWidgetAddons'
import { SimpleStyledText } from '@cowprotocol/ui'

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined): ReactNode {
  const symbolName = symbols?.[0] || t`Native currency (e.g ETH)`
  const minutes = MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60

  return (
    <SimpleStyledText>
      <p>
        <Trans>
          {symbolName} orders require a minimum transaction expiration time threshold of {minutes} minutes to ensure the
          best swapping experience.
        </Trans>
      </p>
      <p>
        <Trans>Orders not matched after the threshold time are automatically refunded.</Trans>
      </p>
    </SimpleStyledText>
  )
}

export function getNonNativeOrderDeadlineTooltip(): ReactNode {
  return (
    <SimpleStyledText>
      <p><Trans>Your swap expires and will not execute if it is pending for longer than the selected duration.</Trans></p>
      <p>{i18n._(INPUT_OUTPUT_EXPLANATION)}</p>
    </SimpleStyledText>
  )
}

export function getNativeSlippageTooltip(symbols: (string | undefined)[] | undefined): ReactNode {
  const minimumETHFlowSlippage = MINIMUM_ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)
  const aNativeCurrency = symbols?.[0] || t`a native currency`
  const currencyNameCapitalized = symbols?.[0] || t`Native currency`
  const currencyName = symbols?.[0] || t`native currency`

  return (
    <SimpleStyledText>
      <p><Trans>
        When selling {aNativeCurrency}, the minimum slippage tolerance is set to {minimumETHFlowSlippage}% or higher to
        ensure a high likelihood of order matching, even in volatile market conditions.
      </Trans></p>
      <p><Trans>
        {currencyNameCapitalized} orders can, in rare cases, be frontrun due to their on-chain component. For more
        robust MEV protection, consider wrapping your {currencyName} before trading.
      </Trans></p>
    </SimpleStyledText>
  )
}

interface GetNonNativeSlippageTooltipParams {
  isDynamic?: boolean
  isSettingsModal?: boolean
  slippageWarningParams?: SlippageWarningParams | null
}

export function getNonNativeSlippageTooltip({
  isDynamic,
  isSettingsModal,
  slippageWarningParams,
}: GetNonNativeSlippageTooltipParams = {}): ReactNode {
  if (isDynamic) {
    return (
      <SimpleStyledText>
        <p><Trans>
          CoW Swap has dynamically selected this slippage tolerance, accounting for current gas prices and trade size, to ensure your trade executes quickly while still getting the best price.
        </Trans></p>

        {isSettingsModal ? (<>
          <p><Trans>
            To override this, enter your desired slippage amount, but this may result in slower execution.
          </Trans></p>
          <p><Trans>
            Either way, trades are protected from MEV, so your slippage can't be exploited!
          </Trans></p>
        </>) : (
          <p><Trans>
            Trades are protected from MEV, so your slippage can't be exploited!
          </Trans></p>
        ) }
      </SimpleStyledText>
    )
  }

  let manualSlippageMessage = <Trans>Manual slippage set.</Trans>

  if (slippageWarningParams?.tooLow) {
    manualSlippageMessage = <Trans>With low slippage, your transaction may expire.</Trans>
  } else if (slippageWarningParams?.tooHigh) {
    manualSlippageMessage = <Trans>With high slippage, you may not get the best price.</Trans>
  }

  return (
    <SimpleStyledText>
      <p>{ manualSlippageMessage }</p>
      { isSettingsModal ? (<>
        <p><Trans>To let Cow Swap automatically select the slippage tolerance, toggle the "Dynamic" option.</Trans></p>
        <p><Trans>Either way, trades are protected from MEV, so your slippage can't be exploited!</Trans></p>
      </>) : (
        <p><Trans>Trades are protected from MEV, so your slippage can't be exploited!</Trans></p>
      ) }
    </SimpleStyledText>
  )
}
