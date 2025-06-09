import { percentToBps } from '@cowprotocol/common-utils'
import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'

const StyledInlineBanner = styled(InlineBanner)`
  text-align: center;
`

export type HighSuggestedSlippageWarningProps = {
  isTradePriceUpdating: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    <StyledInlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} noWrapContent>
      Slippage adjusted to {`${slippageBps / 100}`}% to ensure quick execution
      <InfoTooltip
        size={24}
        content="CoW Swap dynamically adjusts your slippage tolerance based on current gas prices and trade size. You can set a custom slippage using the settings icon above."
      />
    </StyledInlineBanner>
  )
}
