import { useAtom, useAtomValue } from 'jotai'
import React, { ReactNode } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import { useIsZeroBalance } from 'modules/combinedBalances'
import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useTradeConfirmActions,
  useFreezeWhileConfirming,
  useCommonTradeConfirmContext,
} from 'modules/trade'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeRateDetails } from '../TradeRateDetails'

export interface LimitOrdersConfirmModalProps {
  doTrade(): Promise<void>
  isTradeContextReady: boolean
  isSafeApprovalBundle: boolean
  recipient?: string | null
  recipientAddressOrName?: string | null
  partiallyFillable: boolean
  validTo: number
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps): ReactNode {
  const CONFIRM_TITLE = t`Review Limit Order`
  const {
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpact,
    recipient,
    recipientAddressOrName,
    partiallyFillable,
    validTo,
    isSafeApprovalBundle,
    doTrade,
    isTradeContextReady,
  } = props

  const { account, chainId } = useWalletInfo()
  const appData = useAppData()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)

  const tradeConfirmActions = useTradeConfirmActions()

  // Freeze everything derived from limit-order state once the user clicks confirm, so the review
  // screen can never display different values than what was actually placed.
  const { frozenRecipient, frozenRecipientAddressOrName, frozenPartiallyFillable, frozenValidTo } =
    useFreezeWhileConfirming({
      frozenRecipient: recipient,
      frozenRecipientAddressOrName: recipientAddressOrName,
      frozenPartiallyFillable: partiallyFillable,
      frozenValidTo: validTo,
    })

  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  // Limit orders may be placed with amount > balance, so only block when the sell token balance
  // dropped to 0 while the modal was open (e.g. a previous order fully filled) — see issue #5645.
  const isInsufficientBalance = useIsZeroBalance(inputAmount?.currency)
  const isConfirmDisabled = (isTooLowRate ? !warningsAccepted : false) || isInsufficientBalance || !isTradeContextReady

  const inputSymbol = inputAmount?.currency?.symbol || t`token`
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
        recipient={frozenRecipient}
        appData={appData}
        isPriceStatic
      >
        {(restContent) => (
          <>
            <LimitOrdersDetails
              account={account ?? ''}
              chainId={chainId as SupportedChainId}
              recipient={frozenRecipient}
              recipientAddressOrName={frozenRecipientAddressOrName}
              partiallyFillable={frozenPartiallyFillable}
              validTo={frozenValidTo}
              limitRateState={limitRateState}
              rateInfoParams={rateInfoParams}
              executionPrice={executionPrice}
              partiallyFillableOverride={partiallyFillableOverride}
            >
              <TradeRateDetails />
            </LimitOrdersDetails>
            {restContent}
            <LimitOrdersWarnings isConfirmScreen={true} />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
