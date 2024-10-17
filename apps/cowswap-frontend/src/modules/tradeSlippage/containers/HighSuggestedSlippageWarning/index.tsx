import { percentToBps } from '@cowprotocol/common-utils'
import { BannerOrientation, InfoTooltip, InlineBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'

export type HighSuggestedSlippageWarningProps = {
  isTradePriceUpdating: boolean
}

export function HighSuggestedSlippageWarning(props: HighSuggestedSlippageWarningProps) {
  const { isTradePriceUpdating } = props
  const { account } = useWalletInfo()
  const slippage = useTradeSlippage()

  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isSuggestedSlippage = isSmartSlippageApplied && !isTradePriceUpdating && !!account
  const slippageBps = percentToBps(slippage)

  if (!isSuggestedSlippage || !slippageBps || slippageBps <= 200) {
    return null
  }

  return (
    <InlineBanner bannerType="alert" orientation={BannerOrientation.Horizontal} noWrapContent>
      Slippage adjusted to {`${slippageBps / 100}`}% to ensure quick execution
      <InfoTooltip size={24} content="CoW Swap dynamically adjusts your slippage tolerance based on current volatility. You can set a custom slippage using the settings icon above." />
    </InlineBanner>
  )
}
