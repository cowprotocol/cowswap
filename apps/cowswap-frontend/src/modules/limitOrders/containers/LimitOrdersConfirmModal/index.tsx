import { useAtom, useAtomValue } from 'jotai'
import React, { ReactNode, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { TokenSymbol } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useIsZeroBalance } from 'modules/combinedBalances'
import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useTradeConfirmActions,
  useCommonTradeConfirmContext,
} from 'modules/trade'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import { TradeRateDetails } from '../TradeRateDetails'

export interface LimitOrdersConfirmModalProps {
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps): ReactNode {
  const CONFIRM_TITLE = t`Review Limit Order`
  const { inputCurrencyInfo, outputCurrencyInfo, tradeContext: tradeContextInitial, priceImpact, recipient } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeContext = useMemo(() => tradeContextInitial, [])

  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)

  const tradeConfirmActions = useTradeConfirmActions()

  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  // Limit orders may be placed with amount > balance, so only block when the sell token balance
  // dropped to 0 while the modal was open (e.g. a previous order fully filled) — see issue #5645.
  const isInsufficientBalance = useIsZeroBalance(inputAmount?.currency)
  const isConfirmDisabled = (isTooLowRate ? !warningsAccepted : false) || isInsufficientBalance

  const inputSymbol = inputAmount?.currency?.symbol || t`token`
  const canUsePermit = tradeContext.allowsOffchainSigning && isSupportedPermitInfo(tradeContext.permitInfo)
  // Temporary: keep limit-order bundles Safe-only until EIP-5792 order lifecycle tracking lands.
  const isSafeApprovalBundle =
    useIsSafeApprovalBundle(inputAmount) && tradeContext.postOrderParams.isSafeWallet && !canUsePermit
  const buttonText = isInsufficientBalance ? (
    t`Insufficient ${inputSymbol} balance`
  ) : isSafeApprovalBundle ? (
    <>
      <Trans>Confirm</Trans> (<Trans>Approve</Trans>&nbsp;
      <TokenSymbol token={inputAmount && getWrappedToken(inputAmount.currency)} length={6} />
      &nbsp;& <Trans>Limit order</Trans>)
    </>
  ) : (
    <Trans>Place limit order</Trans>
  )

  return (
    <TradeConfirmModal orderType={UiOrderType.LIMIT} showGetNotifiedMessage>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={CONFIRM_TITLE}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        appData={tradeContext.postOrderParams.appData || undefined}
        isPriceStatic
      >
        {(restContent) => (
          <>
            {tradeContext && (
              <LimitOrdersDetails
                limitRateState={limitRateState}
                tradeContext={tradeContext}
                rateInfoParams={rateInfoParams}
                settingsState={settingsState}
                executionPrice={executionPrice}
                partiallyFillableOverride={partiallyFillableOverride}
              >
                <TradeRateDetails />
              </LimitOrdersDetails>
            )}
            {restContent}
            <LimitOrdersWarnings isConfirmScreen={true} />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
