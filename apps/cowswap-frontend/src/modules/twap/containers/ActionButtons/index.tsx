import { useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { t } from '@lingui/core/macro'

import { useConfirmTradeWithRwaCheck } from 'modules/trade'
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
  const { walletIsNotConnected } = useTwapWarningsContext()
  const cowAnalytics = useCowAnalytics()

  // Analytics callback that fires only when trade confirmation is actually opened
  const onConfirmOpen = useCallback(() => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.TWAP,
      action: 'Conversion',
      label: `initiated|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
    })
  }, [cowAnalytics, fallbackHandlerIsNotSet])

  const hookParams = useMemo(() => ({ onConfirmOpen }), [onConfirmOpen])
  const { confirmTrade } = useConfirmTradeWithRwaCheck(hookParams)

  const areWarningsAccepted = useAreWarningsAccepted()

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

  return buttons
}
