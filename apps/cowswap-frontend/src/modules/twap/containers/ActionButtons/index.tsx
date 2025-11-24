import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders/pure/ProtocolFeeInfoBanner'
import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useAreWarningsAccepted } from '../../hooks/useAreWarningsAccepted'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface ActionButtonsProps {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
  fallbackHandlerIsNotSet: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ActionButtons({
  localFormValidation,
  primaryFormValidation,
  fallbackHandlerIsNotSet,
}: ActionButtonsProps) {
  const tradeConfirmActions = useTradeConfirmActions()
  const { walletIsNotConnected } = useTwapWarningsContext()
  const cowAnalytics = useCowAnalytics()

  const twapConversionAnalytics = useCallback(
    (status: string, fallbackHandlerIsNotSet: boolean) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Conversion',
        label: `${status}|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
      })
    },
    [cowAnalytics],
  )

  const confirmTrade = useCallback(() => {
    tradeConfirmActions.onOpen()
    twapConversionAnalytics('initiated', fallbackHandlerIsNotSet)
  }, [tradeConfirmActions, twapConversionAnalytics, fallbackHandlerIsNotSet])

  const areWarningsAccepted = useAreWarningsAccepted()
  const { isLimitOrdersProtocolFeeBannerEnabled } = useFeatureFlags()
  const isInjectedWidgetMode = isInjectedWidget()

  const primaryActionContext = {
    confirmTrade,
  }

  const tradeFormButtonContext = useTradeFormButtonContext(t`TWAP order`, confirmTrade)

  if (!tradeFormButtonContext) return null

  // Show local form validation errors only when wallet is connected
  const buttons =
    localFormValidation && !walletIsNotConnected ? (
      <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
    ) : (
      <TradeFormButtons
        confirmText={t`Review TWAP order`}
        validation={primaryFormValidation}
        context={tradeFormButtonContext}
        isDisabled={!areWarningsAccepted}
      />
    )

  return (
    <>
      {!isInjectedWidgetMode && isLimitOrdersProtocolFeeBannerEnabled && <ProtocolFeeInfoBanner />}
      {buttons}
    </>
  )
}
