import { useTradeTracking, TradeType, TradeTrackingEventType } from '@cowprotocol/analytics'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useOrderSubmittedContent,
  useReceiveAmountInfo,
  useTradeConfirmActions,
} from 'modules/trade'
import { HighFeeWarning, RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'
const PRICE_UPDATE_INTERVAL = ms`30s`

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function SwapConfirmModal(props: SwapConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade: originalDoTrade } = props

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()
  const tradeTracking = useTradeTracking()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId)
  const labelsAndTooltips = useLabelsAndTooltips()

  // Parse currency amounts for tracking
  let fromAmount = inputCurrencyInfo.amount ? parseFloat(inputCurrencyInfo.amount.toSignificant(6)) : undefined
  if (fromAmount !== undefined && Number.isNaN(fromAmount)) {
    console.warn('Invalid "fromAmount" encountered, defaulting to undefined')
    fromAmount = undefined
  }

  let toAmount = outputCurrencyInfo.amount ? parseFloat(outputCurrencyInfo.amount.toSignificant(6)) : undefined
  if (toAmount !== undefined && Number.isNaN(toAmount)) {
    console.warn('Invalid "toAmount" encountered, defaulting to undefined')
    toAmount = undefined
  }

  // Parse fiat amounts for tracking
  let fromAmountUSD = inputCurrencyInfo.fiatAmount
    ? typeof inputCurrencyInfo.fiatAmount === 'number'
      ? inputCurrencyInfo.fiatAmount
      : Number(inputCurrencyInfo.fiatAmount.toSignificant(6))
    : undefined
  if (fromAmountUSD !== undefined && Number.isNaN(fromAmountUSD)) {
    console.warn('Invalid "fromAmountUSD" encountered, defaulting to undefined')
    fromAmountUSD = undefined
  }

  let toAmountUSD = outputCurrencyInfo.fiatAmount
    ? typeof outputCurrencyInfo.fiatAmount === 'number'
      ? outputCurrencyInfo.fiatAmount
      : Number(outputCurrencyInfo.fiatAmount.toSignificant(6))
    : undefined
  if (toAmountUSD !== undefined && Number.isNaN(toAmountUSD)) {
    console.warn('Invalid "toAmountUSD" encountered, defaulting to undefined')
    toAmountUSD = undefined
  }

  // Enhanced trade function with GTM tracking
  const doTrade = async () => {
    if (account) {
      // Track order submission
      tradeTracking.onOrderSubmitted({
        walletAddress: account,
        tradeType: TradeType.SWAP,
        fromAmount,
        fromCurrency: inputCurrencyInfo.amount?.currency.symbol,
        fromAmountUSD,
        toAmount,
        toCurrency: outputCurrencyInfo.amount?.currency.symbol,
        toAmountUSD,
        contractAddress: inputCurrencyInfo.amount?.currency.isToken
          ? inputCurrencyInfo.amount.currency.address
          : undefined,
      })

      console.info(`[Analytics] Tracked ${TradeTrackingEventType.ORDER_SUBMITTED} event`)
    }

    try {
      // Execute the original trade function
      const result = await originalDoTrade()

      return result
    } catch (error) {
      // Track failure
      if (account) {
        tradeTracking.onOrderFailed(
          {
            walletAddress: account,
            tradeType: TradeType.SWAP,
            fromCurrency: inputCurrencyInfo.amount?.currency.symbol,
            toCurrency: outputCurrencyInfo.amount?.currency.symbol,
            contractAddress: inputCurrencyInfo.amount?.currency.isToken
              ? inputCurrencyInfo.amount.currency.address
              : undefined,
          },
          error instanceof Error ? error.message : String(error),
        )

        console.error(`[Analytics] Tracked ${TradeTrackingEventType.ORDER_FAILED} event:`, error)
      }

      // Re-throw the error to maintain the original behavior
      throw error
    }
  }

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText="Confirm Swap"
        recipient={recipient}
        appData={appData || undefined}
        refreshInterval={PRICE_UPDATE_INTERVAL}
      >
        {(restContent) => (
          <>
            {receiveAmountInfo && slippage && (
              <TradeBasicConfirmDetails
                rateInfoParams={rateInfoParams}
                slippage={slippage}
                receiveAmountInfo={receiveAmountInfo}
                recipient={recipient}
                account={account}
                labelsAndTooltips={labelsAndTooltips}
                hideLimitPrice
                hideUsdValues
                withTimelineDot={false}
              >
                <RowDeadline deadline={deadline} />
              </TradeBasicConfirmDetails>
            )}
            {restContent}
            <HighFeeWarning readonlyMode />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
