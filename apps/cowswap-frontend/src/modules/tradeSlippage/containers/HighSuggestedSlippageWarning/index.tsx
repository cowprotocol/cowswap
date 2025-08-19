import { ReactNode } from 'react'

import { ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD } from '@cowprotocol/common-const'
import { isFractionFalsy, percentToBps } from '@cowprotocol/common-utils'
import { BannerOrientation, InfoTooltip, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useDerivedTradeState, useIsEoaEthFlow } from 'modules/trade'
import { useIsSmartSlippageApplied, useSlippageConfig, useTradeSlippage } from 'modules/tradeSlippage'

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
  const { defaultValue } = useSlippageConfig()

  const minimalSlippageAppBps = isEoaEthFlow
    ? ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD[chainId]
    : MINIMAL_ERC20_FLOW_SLIPPAGE_BPS
  const minimalSlippageBps = Math.max(defaultValue, minimalSlippageAppBps)

  if (!isSuggestedSlippage || !slippageBps || slippageBps <= minimalSlippageBps || !amountsAreSet) {
    return null
  }

  const slippageBpsPercentage = slippageBps / 100

  return (
    <StyledInlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} noWrapContent>
      <Trans>Slippage adjusted to {slippageBpsPercentage}% to ensure quick execution</Trans>
      <InfoTooltip
        size={24}
        content={t`CoW Swap dynamically adjusts your slippage tolerance based on current gas prices and trade size. You can set a custom slippage using the settings icon above.`}
      />
    </StyledInlineBanner>
  )
}
