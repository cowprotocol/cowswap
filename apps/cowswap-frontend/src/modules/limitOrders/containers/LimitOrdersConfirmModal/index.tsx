import { useAtom, useAtomValue } from 'jotai'
import React, { ReactNode, useMemo } from 'react'

import { getWrappedToken, getCurrencyAddress } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

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
  inputToken?: Currency
  outputToken?: Currency
  side: 'sell' | 'buy'
  executionPrice?: ExecutionPriceLike
  inputAmount?: CurrencyAmount<Currency> | null
  partialFillsEnabled: boolean
}): string {
  const { inputToken, outputToken, side, executionPrice, inputAmount, partialFillsEnabled } = params
  const inputSymbol = inputToken?.symbol || ''
  const outputSymbol = outputToken?.symbol || ''
  const priceStr = executionPrice ? executionPrice.toSignificant(6) : ''
  const inputAmountHuman = inputAmount ? inputAmount.toSignificant(6) : ''

  return `TokenIn: ${inputSymbol}, TokenOut: ${outputSymbol}, Side: ${side}, Price: ${priceStr}, Amount: ${inputAmountHuman}, PartialFills: ${partialFillsEnabled}`
}

type ExecutionPriceLike = { toSignificant: (n: number) => string } | null | undefined

function buildPlaceLimitOrderEvent(params: {
  inputAmount: NonNullable<LimitOrdersConfirmModalProps['inputCurrencyInfo']['amount']>
  outputAmount: NonNullable<LimitOrdersConfirmModalProps['outputCurrencyInfo']['amount']>
  side: 'sell' | 'buy'
  executionPrice?: ExecutionPriceLike
  partialFillsEnabled: boolean
  walletAddress?: string
  chainId?: number
}): string {
  const { inputAmount, outputAmount, side, executionPrice, partialFillsEnabled, walletAddress, chainId } = params
  const inputToken = inputAmount.currency
  const outputToken = outputAmount.currency

  const label = buildLimitOrderEventLabel({
    inputToken,
    outputToken,
    side,
    executionPrice,
    inputAmount,
    partialFillsEnabled,
  })

  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.LIMIT_ORDER_SETTINGS,
    action: 'place_limit_order',
    label,
    chainId,
    walletAddress,
    sellToken: getCurrencyAddress(inputToken),
    sellTokenSymbol: inputToken.symbol || '',
    sellTokenChainId: inputToken.chainId ?? chainId,
    sellAmount: inputAmount.toExact(),
    sellAmountHuman: inputAmount.toSignificant(6),
    buyToken: getCurrencyAddress(outputToken),
    buyTokenSymbol: outputToken.symbol || '',
    buyTokenChainId: outputToken.chainId ?? chainId,
    buyAmountExpected: outputAmount.toExact(),
    buyAmountHuman: outputAmount.toSignificant(6),
    side,
    ...(executionPrice && { executionPrice: executionPrice.toSignificant(6) }),
  })
}

function buildConfirmButtonText(
  isSafeApprovalBundle: boolean,
  inputAmount: LimitOrdersConfirmModalProps['inputCurrencyInfo']['amount'],
): ReactNode {
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

  const { account, chainId } = useWalletInfo()
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
    const walletAddress = account || undefined
    const resolvedChainId = chainId ?? tradeContext.postOrderParams.chainId
    const side = tradeContext.postOrderParams.kind === OrderKind.SELL ? 'sell' : 'buy'

    return buildPlaceLimitOrderEvent({
      inputAmount,
      outputAmount,
      side,
      executionPrice,
      partialFillsEnabled: settingsState.partialFillsEnabled,
      walletAddress,
      chainId: resolvedChainId,
    })
  }, [
    account,
    chainId,
    executionPrice,
    inputAmount,
    limitRateState.activeRate,
    outputAmount,
    settingsState,
    tradeContext,
  ])

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
