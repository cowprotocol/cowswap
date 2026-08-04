import { ReactNode, useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useIsSafeViaWc, useIsSafeWallet } from '@cowprotocol/wallet'

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

export function ActionButtons({
  localFormValidation,
  primaryFormValidation,
  fallbackHandlerIsNotSet,
}: ActionButtonsProps): ReactNode {
  const { walletIsNotConnected } = useTwapWarningsContext()
  const cowAnalytics = useCowAnalytics()
  const isSafeWallet = useIsSafeWallet()
  const isSafeViaWc = useIsSafeViaWc()
  const { isTwapEoaEnabled } = useFeatureFlags()

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

  const isEoaTwap = !!isTwapEoaEnabled && !isSafeWallet && !isSafeViaWc

  // EOA TWAP handles EOA => Vault approvals in the multi-step flow, not via LegacyApproveButton, so we just pass `null`
  // in that case:
  const validation =
    isEoaTwap && primaryFormValidation === TradeFormValidation.ApproveRequired ? null : primaryFormValidation

  if (!tradeFormButtonContext) return null

  // Show local form validation errors only when wallet is connected
  const buttons =
    localFormValidation && !walletIsNotConnected ? (
      <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
    ) : (
      <TradeFormButtons
        confirmText={t`Review TWAP order`}
        validation={validation}
        context={tradeFormButtonContext}
        isDisabled={!areWarningsAccepted}
      />
    )

  return buttons
}
