import { useAtom, useAtomValue } from 'jotai'
import React, { ReactNode, useMemo } from 'react'

import { getWrappedToken, getCurrencyAddress } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import { TradeRateDetails } from '../TradeRateDetails'

const CONFIRM_TITLE = 'Limit Order'

export interface LimitOrdersConfirmModalProps {
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

function buildLimitOrderEventLabel(params: {
  inputSymbol?: string
  outputSymbol?: string
  side: string
  executionPrice?: string
  inputAmountHuman: string
  partialFillsEnabled: boolean
}): string {
  const { inputSymbol, outputSymbol, side, executionPrice, inputAmountHuman, partialFillsEnabled } = params
  return `TokenIn: ${inputSymbol || ''}, TokenOut: ${outputSymbol || ''}, Side: ${side}, Price: ${executionPrice || ''}, Amount: ${inputAmountHuman}, PartialFills: ${partialFillsEnabled}`
}

type ExecutionPriceLike = { toSignificant: (n: number) => string } | null | undefined

function buildPlaceLimitOrderEvent(params: {
  inputAmount: LimitOrdersConfirmModalProps['inputCurrencyInfo']['amount']
  outputAmount: LimitOrdersConfirmModalProps['outputCurrencyInfo']['amount']
  side: 'sell' | 'buy'
  executionPrice?: ExecutionPriceLike
  partialFillsEnabled: boolean
}): string {
  const { inputAmount, outputAmount, side, executionPrice, partialFillsEnabled } = params

  const inputToken = inputAmount!.currency
  const outputToken = outputAmount!.currency

  const label = buildLimitOrderEventLabel({
    inputSymbol: inputToken.symbol || '',
    outputSymbol: outputToken.symbol || '',
    side,
    executionPrice: executionPrice ? executionPrice.toSignificant(6) : undefined,
    inputAmountHuman: inputAmount!.toSignificant(6),
    partialFillsEnabled,
  })

  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.LIMIT_ORDER_SETTINGS,
    action: 'place_limit_order',
    label,
    sellToken: getCurrencyAddress(inputToken),
    sellTokenSymbol: inputToken.symbol || '',
    sellTokenChainId: inputToken.chainId,
    sellAmount: inputAmount!.quotient.toString(),
    sellAmountHuman: inputAmount!.toSignificant(6),
    buyToken: getCurrencyAddress(outputToken),
    buyTokenSymbol: outputToken.symbol || '',
    buyTokenChainId: outputToken.chainId,
    buyAmountExpected: outputAmount!.quotient.toString(),
    buyAmountHuman: outputAmount!.toSignificant(6),
    side,
    ...(executionPrice && { executionPrice: executionPrice.toSignificant(6) }),
  })
}

function buildConfirmButtonText(isSafeApprovalBundle: boolean, inputAmount: LimitOrdersConfirmModalProps['inputCurrencyInfo']['amount']): ReactNode {
  if (!isSafeApprovalBundle) return 'Place limit order'

  return (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={inputAmount && getWrappedToken(inputAmount.currency)} length={6} />
      &nbsp;& Limit order)
    </>
  )
}

export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps): ReactNode {
  const { inputCurrencyInfo, outputCurrencyInfo, tradeContext: tradeContextInitial, priceImpact, recipient } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeContext = useMemo(() => tradeContextInitial, [])

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
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
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = buildConfirmButtonText(isSafeApprovalBundle, inputAmount)

  // Generate analytics data for limit order placement
  const placeLimitOrderEvent = useMemo(() => {
    if (!inputAmount || !outputAmount || !limitRateState.activeRate) return undefined

    const side = limitRateState.isInverted ? 'sell' : 'buy'

    return buildPlaceLimitOrderEvent({
      inputAmount,
      outputAmount,
      side,
      executionPrice,
      partialFillsEnabled: settingsState.partialFillsEnabled,
    })
  }, [inputAmount, outputAmount, executionPrice, limitRateState, settingsState])

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
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
        data-click-event={placeLimitOrderEvent}
        beforeContent={
          tradeContext ? (
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
          ) : undefined
        }
        afterContent={<LimitOrdersWarnings isConfirmScreen={true} />}
      />
    </TradeConfirmModal>
  )
}
