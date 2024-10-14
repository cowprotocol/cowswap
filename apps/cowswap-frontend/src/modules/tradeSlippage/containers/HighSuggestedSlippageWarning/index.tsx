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
      Beware! High dynamic slippage suggested ({`${slippageBps / 100}`}%)
      <InfoTooltip size={24} content="It's not thaaat bad. Just to make sure you noticed 😉" />
    </InlineBanner>
  )
}
