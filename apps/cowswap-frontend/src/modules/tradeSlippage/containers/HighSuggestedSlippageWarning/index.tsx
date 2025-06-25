import { ReactNode } from 'react'

import { ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD } from '@cowprotocol/common-const'
import { isFractionFalsy, percentToBps } from '@cowprotocol/common-utils'
import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useDerivedTradeState, useIsEoaEthFlow } from 'modules/trade'
import { useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'

const MINIMAL_ERC20_FLOW_SLIPPAGE_BPS = 200

const StyledInlineBanner = styled(InlineBanner)`
  text-align: center;
`

export type HighSuggestedSlippageWarningProps = {
  isTradePriceUpdating: boolean
}

export function HighSuggestedSlippageWarning(props: HighSuggestedSlippageWarningProps): ReactNode {
  const { isTradePriceUpdating } = props
  const { account, chainId } = useWalletInfo()
  const slippage = useTradeSlippage()
  const state = useDerivedTradeState()

  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isSuggestedSlippage = isSmartSlippageApplied && !isTradePriceUpdating && !!account
  const slippageBps = percentToBps(slippage)
  const amountsAreSet = !isFractionFalsy(state?.inputCurrencyAmount) && !isFractionFalsy(state?.outputCurrencyAmount)

  const isEoaEthFlow = useIsEoaEthFlow()
  const minimalSlippageBps = isEoaEthFlow ? ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD[chainId] : MINIMAL_ERC20_FLOW_SLIPPAGE_BPS

  if (!isSuggestedSlippage || !slippageBps || slippageBps <= minimalSlippageBps || !amountsAreSet) {
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
